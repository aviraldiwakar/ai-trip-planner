package com.collaborative.planner.service;

import com.collaborative.planner.model.DestinationPreference;
import com.collaborative.planner.model.GeneratedTrip;
import com.collaborative.planner.repository.DestinationPreferenceRepository;
import com.collaborative.planner.repository.GeneratedTripRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class TripGenerationService {

    @Autowired
    private DestinationPreferenceRepository preferenceRepository;

    @Autowired
    private GeneratedTripRepository generatedTripRepository;

    @Value("${python.script.path:python-ai/similarity.py}")
    private String pythonScriptPath;

    @Value("${python.executable:python3}")
    private String pythonExecutable;

    public static class TripGenerationResult {
        private String winningDestination;
        private LocalDate commonStartDate;
        private LocalDate commonEndDate;
        private boolean dateOverlapValid;
        private List<DestinationPreference> userProposals;
        private String aiSuggestions;

        public TripGenerationResult(String winningDestination, LocalDate commonStartDate, LocalDate commonEndDate,
                                    boolean dateOverlapValid, List<DestinationPreference> userProposals, String aiSuggestions) {
            this.winningDestination = winningDestination;
            this.commonStartDate = commonStartDate;
            this.commonEndDate = commonEndDate;
            this.dateOverlapValid = dateOverlapValid;
            this.userProposals = userProposals;
            this.aiSuggestions = aiSuggestions;
        }

        public String getWinningDestination() { return winningDestination; }
        public LocalDate getCommonStartDate() { return commonStartDate; }
        public LocalDate getCommonEndDate() { return commonEndDate; }
        public boolean isDateOverlapValid() { return dateOverlapValid; }
        public List<DestinationPreference> getUserProposals() { return userProposals; }
        public String getAiSuggestions() { return aiSuggestions; }
    }

    public TripGenerationResult generateTrip(Integer groupId) throws Exception {
        // 1. Fetch preferences for group ID
        List<DestinationPreference> preferences = preferenceRepository.findByGroupId(groupId);
        if (preferences.isEmpty()) {
            throw new IllegalArgumentException("No preferences submitted by members for this group yet.");
        }

        // 2. Overlap Engine
        LocalDate commonStartDate = LocalDate.MIN;
        LocalDate commonEndDate = LocalDate.MAX;

        for (DestinationPreference pref : preferences) {
            if (pref.getFromDate().isAfter(commonStartDate)) {
                commonStartDate = pref.getFromDate();
            }
            if (pref.getToDate().isBefore(commonEndDate)) {
                commonEndDate = pref.getToDate();
            }
        }

        boolean dateOverlapValid = !commonStartDate.isAfter(commonEndDate);
        if (!dateOverlapValid) {
            throw new IllegalStateException("Overlap Engine: Group preferences contain non-overlapping date ranges. No viable common schedule.");
        }

        // 3. Priority Engine
        // Group by destination_name (case insensitive) and sum up priority scores
        Map<String, Integer> scoreMap = new HashMap<>();
        Map<String, String> displayNames = new HashMap<>(); // To preserve original case of first entry

        for (DestinationPreference pref : preferences) {
            String norm = pref.getDestinationName().trim().toLowerCase();
            scoreMap.put(norm, scoreMap.getOrDefault(norm, 0) + pref.getPriorityScore());
            if (!displayNames.containsKey(norm)) {
                displayNames.put(norm, pref.getDestinationName().trim());
            }
        }

        String winningNorm = scoreMap.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElseThrow(() -> new IllegalStateException("Preference aggregation failed."));

        String winningDestination = displayNames.get(winningNorm);

        // 4. Python Bridge
        // Gather list of destination proposals to feed the recommender system
        List<String> proposedDestinations = displayNames.values().stream().collect(Collectors.toList());
        String aiSuggestionsJson = invokePythonRecommender(proposedDestinations);

        // 5. Store / Update history record
        Optional<GeneratedTrip> existing = generatedTripRepository.findByGroupId(groupId);
        GeneratedTrip trip;
        if (existing.isPresent()) {
            trip = existing.get();
            trip.setFinalDestination(winningDestination);
            trip.setStartDate(commonStartDate);
            trip.setEndDate(commonEndDate);
            trip.setAiSuggestions(aiSuggestionsJson);
        } else {
            trip = new GeneratedTrip(null, groupId, winningDestination, commonStartDate, commonEndDate, aiSuggestionsJson);
        }
        generatedTripRepository.save(trip);

        return new TripGenerationResult(
                winningDestination,
                commonStartDate,
                commonEndDate,
                true,
                preferences,
                aiSuggestionsJson
        );
    }

    private String invokePythonRecommender(List<String> destinations) {
        try {
            // Setup execution command: [python3, python-ai/similarity.py, "Bali", "Paris", ...]
            List<String> command = new ArrayList<>();
            command.add(pythonExecutable);
            command.add(pythonScriptPath);
            command.addAll(destinations);

            ProcessBuilder pb = new ProcessBuilder(command);
            pb.redirectErrorStream(true); // merge standard error and standard output processes

            Process process = pb.start();

            BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()));
            StringBuilder output = new StringBuilder();
            String line;
            while ((line = reader.readLine()) != null) {
                output.append(line);
            }

            int exitCode = process.waitFor();
            if (exitCode != 0) {
                System.err.println("Python Engine process exited with error status code " + exitCode);
                return "[]";
            }

            return output.toString();
        } catch (Exception e) {
            System.err.println("Spring Boot Python Bridge execution thrown exception: " + e.getMessage());
            // Safe fallback response to prevent API failure
            return "[]";
        }
    }
}
