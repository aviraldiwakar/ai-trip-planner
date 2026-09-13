package com.collaborative.planner.service;

import com.collaborative.planner.model.DestinationPreference;
import com.collaborative.planner.model.GeneratedTrip;
import com.collaborative.planner.repository.DestinationPreferenceRepository;
import com.collaborative.planner.repository.GeneratedTripRepository;
import com.collaborative.planner.dto.TripEnrichmentResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;

@Service
public class TripGenerationService {

    @Autowired
    private DestinationPreferenceRepository preferenceRepository;

    @Autowired
    private GeneratedTripRepository generatedTripRepository;

    @Autowired
    private AiIntegrationService aiIntegrationService;

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
        LocalDate latestStart = LocalDate.MIN;
        LocalDate earliestEnd = LocalDate.MAX;

        LocalDate absoluteMinDate = LocalDate.MAX;
        LocalDate absoluteMaxDate = LocalDate.MIN;

        for (DestinationPreference pref : preferences) {
            // Track absolute outer bounds for AI fallback
            if (pref.getFromDate().isBefore(absoluteMinDate)) absoluteMinDate = pref.getFromDate();
            if (pref.getToDate().isAfter(absoluteMaxDate)) absoluteMaxDate = pref.getToDate();

            // Track strict overlap
            if (pref.getFromDate().isAfter(latestStart)) latestStart = pref.getFromDate();
            if (pref.getToDate().isBefore(earliestEnd)) earliestEnd = pref.getToDate();
        }

        boolean dateOverlapValid = !latestStart.isAfter(earliestEnd);

        // If overlap fails, provide the total outer window to the AI instead of crashing
        LocalDate finalStartDate = dateOverlapValid ? latestStart : absoluteMinDate;
        LocalDate finalEndDate = dateOverlapValid ? earliestEnd : absoluteMaxDate;

        // 3. Priority Engine
        Map<String, Integer> scoreMap = new HashMap<>();
        Map<String, String> displayNames = new HashMap<>();

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

        // 4. Call the AI Python Microservice using the calculated group data
        TripEnrichmentResponse aiResponse = aiIntegrationService.getTripEnrichment(
                winningDestination,
                finalStartDate.toString(),
                finalEndDate.toString()
        );
        // Convert the AI response to a JSON string to save in the DB
        ObjectMapper objectMapper = new ObjectMapper();
        String aiSuggestionsJson = objectMapper.writeValueAsString(aiResponse);

        // 5. Store / Update history record
        Optional<GeneratedTrip> existing = generatedTripRepository.findByGroupId(groupId);
        GeneratedTrip trip;
        if (existing.isPresent()) {
            trip = existing.get();
            trip.setFinalDestination(winningDestination);
            trip.setStartDate(finalStartDate); // Corrected variable
            trip.setEndDate(finalEndDate);     // Corrected variable
            trip.setAiSuggestions(aiSuggestionsJson);
        } else {
            trip = new GeneratedTrip(null, groupId, winningDestination, finalStartDate, finalEndDate, aiSuggestionsJson); // Corrected variables
        }

        generatedTripRepository.save(trip);

        return new TripGenerationResult(
                winningDestination,
                finalStartDate,    // Corrected variable
                finalEndDate,      // Corrected variable
                dateOverlapValid,  // Now correctly passes the overlap boolean instead of a hardcoded 'true'
                preferences,
                aiSuggestionsJson
        );
    }
}