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
                commonStartDate.toString(),
                commonEndDate.toString()
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
}