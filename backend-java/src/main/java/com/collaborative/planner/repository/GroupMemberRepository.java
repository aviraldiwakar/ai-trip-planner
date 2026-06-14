package com.collaborative.planner.repository;

import com.collaborative.planner.model.GroupMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface GroupMemberRepository extends JpaRepository<GroupMember, Integer> {
    List<GroupMember> findByGroupId(Integer groupId);
    List<GroupMember> findByUserId(Integer userId);
    Optional<GroupMember> findByUserIdAndGroupId(Integer userId, Integer groupId);
    boolean existsByUserIdAndGroupId(Integer userId, Integer groupId);
}
