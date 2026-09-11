package com.collaborative.planner.controller;

import com.collaborative.planner.model.GroupMember;
import com.collaborative.planner.repository.GroupMemberRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.List;

@RestController
@RequestMapping("/api/groups")
@CrossOrigin(origins = "*")
public class GroupController {

    @Autowired
    private GroupMemberRepository groupMemberRepository;

    @PostMapping("/join")
    public ResponseEntity<?> joinGroup(@RequestBody Map<String, Integer> payload) {
        Integer groupId = payload.get("groupId");
        Integer userId = payload.get("userId");

        // Check if user is already in the group
        if (!groupMemberRepository.existsByUserIdAndGroupId(userId, groupId)) {
            GroupMember newMember = new GroupMember();
            newMember.setGroupId(groupId);
            newMember.setUserId(userId);
            // If your GroupMember entity requires a default role, add it here (e.g., newMember.setRole("MEMBER");)
            groupMemberRepository.save(newMember);
        }

        return ResponseEntity.ok().body(Map.of("message", "Successfully joined group", "groupId", groupId));
    }
    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getUserGroups(@PathVariable Integer userId) {
        List<GroupMember> memberships = groupMemberRepository.findByUserId(userId);
        return ResponseEntity.ok(memberships);
    }
}