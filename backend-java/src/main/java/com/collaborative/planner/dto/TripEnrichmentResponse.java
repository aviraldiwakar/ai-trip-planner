package com.collaborative.planner.dto;

import java.util.List;

public record TripEnrichmentResponse(
        List<String> top_place_spots,
        String best_time_to_visit,
        boolean is_good_time,
        String time_warning,
        String alternative_destination,
        String alternative_reason
) {}