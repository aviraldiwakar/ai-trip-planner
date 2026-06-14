package com.collaborative.planner.controller;

import com.collaborative.planner.service.TripGenerationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/trips")
@CrossOrigin(origins = "*")
public class TripController {

    @Autowired
    private TripGenerationService tripGenerationService;

    @PostMapping("/generate")
    public ResponseEntity<?> generateCollaborativeTrip(@RequestBody Map<String, Integer> requestBody) {
        Integer groupId = requestBody.get("groupId");
        if (groupId == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "GroupId parameter is required inside request payload."));
        }

        try {
            TripGenerationService.TripGenerationResult result = tripGenerationService.generateTrip(groupId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("winningDestination", result.getWinningDestination());
            response.put("commonStartDate", result.getCommonStartDate().toString());
            response.put("commonEndDate", result.getCommonEndDate().toString());
            response.put("dateOverlapValid", result.isDateOverlapValid());
            response.put("userProposals", result.getUserProposals());
            
            // Re-parse the AI Suggestions JSON string from Python into raw structure or return as raw string
            response.put("aiSuggestions", result.getAiSuggestions());

            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            // E.g. No preferences added yet
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                "status", "EMPTY_PREF",
                "message", e.getMessage()
            ));
        } catch (IllegalStateException e) {
            // E.g. Overlap Engine failed
            return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY).body(Map.of(
                "status", "OVERLAP_ERROR",
                "message", e.getMessage()
            ));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "status", "GENERATION_FAILED",
                "message", "An unexpected error occurred: " + e.getMessage()
            ));
        }
    }
}
