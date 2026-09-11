package com.collaborative.planner.repository;

import com.collaborative.planner.model.DestinationPreference;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface DestinationPreferenceRepository extends JpaRepository<DestinationPreference, Integer> {

    List<DestinationPreference> findByGroupId(Integer groupId);

    long countByGroupId(Integer groupId);
}