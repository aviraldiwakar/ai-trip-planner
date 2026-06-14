package com.collaborative.planner.controller;

import com.collaborative.planner.model.DestinationPreference;
import com.collaborative.planner.repository.DestinationPreferenceRepository;
import com.collaborative.planner.repository.GroupMemberRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Map;

@RestController
@RequestMapping("/api/preferences")
@CrossOrigin(origins = "*")
public class PreferenceController {

    @Autowired
    private DestinationPreferenceRepository preferenceRepository;

    @Autowired
    private GroupMemberRepository groupMemberRepository;

    public static class PreferenceSubmitRequest {
        private Integer groupId;
        private Integer userId;
        private String destinationName;
        private LocalDate fromDate;
        private LocalDate toDate;
        private Integer priorityScore;

        public Integer getGroupId() { return groupId; }
        public void setGroupId(Integer groupId) { this.groupId = groupId; }
        public Integer getUserId() { return userId; }
        public void setUserId(Integer userId) { this.userId = userId; }
        public String getDestinationName() { return destinationName; }
        public void setDestinationName(String destinationName) { this.destinationName = destinationName; }
        public LocalDate getFromDate() { return fromDate; }
        public void setFromDate(LocalDate fromDate) { this.fromDate = fromDate; }
        public LocalDate getToDate() { return toDate; }
        public void setToDate(LocalDate toDate) { this.toDate = toDate; }
        public Integer getPriorityScore() { return priorityScore; }
        public void setPriorityScore(Integer priorityScore) { this.priorityScore = priorityScore; }
    }

    @PostMapping("/submit")
    public ResponseEntity<?> submitPreference(@RequestBody PreferenceSubmitRequest req) {
        if (req.getGroupId() == null || req.getUserId() == null || 
            req.getDestinationName() == null || req.getDestinationName().trim().isEmpty() ||
            req.getFromDate() == null || req.getToDate() == null || req.getPriorityScore() == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "All preference fields are required."));
        }

        if (req.getPriorityScore() < 1 || req.getPriorityScore() > 5) {
            return ResponseEntity.badRequest().body(Map.of("message", "Priority score must be an integer between 1 and 5."));
        }

        if (req.getFromDate().isAfter(req.getToDate())) {
            return ResponseEntity.badRequest().body(Map.of("message", "The Start Date ('from') cannot fall after End Date ('to')."));
        }

        // Validate group membership before allowing vote
        boolean isMember = groupMemberRepository.existsByUserIdAndGroupId(req.getUserId(), req.getGroupId());
        if (!isMember) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "User must be a member of the group before submitting preferences."));
        }

        DestinationPreference preference = new DestinationPreference(
                null,
                req.getGroupId(),
                req.getUserId(),
                req.getDestinationName().trim(),
                req.getFromDate(),
                req.getToDate(),
                req.getPriorityScore()
        );

        DestinationPreference saved = preferenceRepository.save(preference);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "message", "Destination preference saved successfully",
                "pref_id", saved.getPrefId()
        ));
    }
}
