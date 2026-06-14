package com.collaborative.planner.controller;

import com.collaborative.planner.model.Group;
import com.collaborative.planner.model.GroupMember;
import com.collaborative.planner.repository.GroupMemberRepository;
import com.collaborative.planner.repository.GroupRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/groups")
@CrossOrigin(origins = "*")
public class GroupController {

    @Autowired
    private GroupRepository groupRepository;

    @Autowired
    private GroupMemberRepository groupMemberRepository;

    public static class CreateGroupRequest {
        private String groupName;
        private Integer userId;

        public String getGroupName() { return groupName; }
        public void setGroupName(String groupName) { this.groupName = groupName; }
        public Integer getUserId() { return userId; }
        public void setUserId(Integer userId) { this.userId = userId; }
    }

    public static class JoinGroupRequest {
        private Integer groupId;
        private Integer userId;

        public Integer getGroupId() { return groupId; }
        public void setGroupId(Integer groupId) { this.groupId = groupId; }
        public Integer getUserId() { return userId; }
        public void setUserId(Integer userId) { this.userId = userId; }
    }

    @PostMapping("/create")
    public ResponseEntity<?> createGroup(@RequestBody CreateGroupRequest req) {
        if (req.getGroupName() == null || req.getGroupName().trim().isEmpty() || req.getUserId() == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "GroupName and Creator UserId are required."));
        }

        // 1. Create and Save the Group
        Group newGroup = new Group(null, req.getGroupName().trim(), req.getUserId());
        Group savedGroup = groupRepository.save(newGroup);

        // 2. Automatically enroll creator into membership
        GroupMember creatorMembership = new GroupMember(null, req.getUserId(), savedGroup.getGroupId());
        groupMemberRepository.save(creatorMembership);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Group created successfully");
        response.put("group_id", savedGroup.getGroupId());
        response.put("group_name", savedGroup.getGroupName());
        response.put("created_by", savedGroup.getCreatedBy());

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/join")
    public ResponseEntity<?> joinGroup(@RequestBody JoinGroupRequest req) {
        if (req.getGroupId() == null || req.getUserId() == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "GroupId and UserId are required."));
        }

        // Check if group actually exists
        Optional<Group> groupOpt = groupRepository.findById(req.getGroupId());
        if (groupOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "The specified Group ID does not exist."));
        }

        // Check if user is already a member
        boolean alreadyMember = groupMemberRepository.existsByUserIdAndGroupId(req.getUserId(), req.getGroupId());
        if (alreadyMember) {
            return ResponseEntity.ok(Map.of(
                "message", "You are already a member of this group.",
                "group_id", req.getGroupId(),
                "group_name", groupOpt.get().getGroupName()
            ));
        }

        // Save new membership record
        GroupMember membership = new GroupMember(null, req.getUserId(), req.getGroupId());
        groupMemberRepository.save(membership);

        return ResponseEntity.ok(Map.of(
            "message", "Successfully joined group",
            "group_id", req.getGroupId(),
            "group_name", groupOpt.get().getGroupName()
        ));
    }
}
