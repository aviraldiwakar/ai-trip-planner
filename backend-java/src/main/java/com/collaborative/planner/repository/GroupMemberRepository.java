package com.collaborative.planner.repository;

import com.collaborative.planner.model.GroupMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface GroupMemberRepository extends JpaRepository<GroupMember, Integer> {

    boolean existsByUserIdAndGroupId(Integer userId, Integer groupId);

    long countByGroupId(Integer groupId);

    List<GroupMember> findByUserId(Integer userId);
}