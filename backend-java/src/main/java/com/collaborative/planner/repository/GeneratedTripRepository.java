package com.collaborative.planner.repository;

import com.collaborative.planner.model.GeneratedTrip;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface GeneratedTripRepository extends JpaRepository<GeneratedTrip, Integer> {
    Optional<GeneratedTrip> findByGroupId(Integer groupId);
}
