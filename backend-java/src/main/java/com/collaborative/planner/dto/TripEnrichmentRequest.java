package com.collaborative.planner.dto;

public record TripEnrichmentRequest(
        String winning_place,
        String start_date,
        String end_date
) {}