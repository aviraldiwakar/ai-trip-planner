package com.collaborative.planner.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "generated_trips")
public class GeneratedTrip {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "trip_id")
    private Integer tripId;

    @Column(name = "group_id", nullable = false)
    private Integer groupId;

    @Column(name = "final_destination", nullable = false, length = 100)
    private String finalDestination;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    // We store JSON string in PostgreSQL JSONB column
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "ai_suggestions", nullable = false, columnDefinition = "jsonb")
    private String aiSuggestions;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public GeneratedTrip() {}

    public GeneratedTrip(Integer tripId, Integer groupId, String finalDestination, LocalDate startDate, LocalDate endDate, String aiSuggestions) {
        this.tripId = tripId;
        this.groupId = groupId;
        this.finalDestination = finalDestination;
        this.startDate = startDate;
        this.endDate = endDate;
        this.aiSuggestions = aiSuggestions;

    }

    // Getters and Setters
    public Integer getTripId() {
        return tripId;
    }

    public void setTripId(Integer tripId) {
        this.tripId = tripId;
    }

    public Integer getGroupId() {
        return groupId;
    }

    public void setGroupId(Integer groupId) {
        this.groupId = groupId;
    }

    public String getFinalDestination() {
        return finalDestination;
    }

    public void setFinalDestination(String finalDestination) {
        this.finalDestination = finalDestination;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }

    public String getAiSuggestions() {
        return aiSuggestions;
    }

    public void setAiSuggestions(String aiSuggestions) {
        this.aiSuggestions = aiSuggestions;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
