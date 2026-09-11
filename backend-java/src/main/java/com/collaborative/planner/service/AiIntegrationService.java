package com.collaborative.planner.service;

import com.collaborative.planner.dto.TripEnrichmentRequest;
import com.collaborative.planner.dto.TripEnrichmentResponse;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

@Service
public class AiIntegrationService {

    private final WebClient webClient;

    public AiIntegrationService(WebClient webClient) {
        this.webClient = webClient;
    }

    public TripEnrichmentResponse getTripEnrichment(String place, String startDate, String endDate) {
        TripEnrichmentRequest request = new TripEnrichmentRequest(place, startDate, endDate);

        return webClient.post()
                .uri("/api/enrich-trip")
                .bodyValue(request)
                .retrieve()
                .bodyToMono(TripEnrichmentResponse.class)
                .block(); // Blocks synchronously to fit standard Spring MVC flow
    }
}