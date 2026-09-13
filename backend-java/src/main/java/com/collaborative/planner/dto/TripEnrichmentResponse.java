package com.collaborative.planner.dto;

import java.util.List;

public record TripEnrichmentResponse(
        List<String> mustVisitPlaces,
        List<String> bestMonths,
        boolean datesAligned,
        String seasonalAdvice,
        List<AlternativeSuggestion> alternativeSuggestions
) {
    // Nested record to handle the array of objects
    public record AlternativeSuggestion(String name, String reason) {}
}