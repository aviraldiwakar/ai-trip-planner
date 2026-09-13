package com.collaborative.planner.controller;

import com.collaborative.planner.model.User;
import com.collaborative.planner.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody User user) {
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email already in use."));
        }

        User savedUser = userRepository.save(user);
        return ResponseEntity.ok(Map.of("message", "Registration successful", "userId", savedUser.getUserId()));
    }

    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody User loginRequest) {
        Optional<User> userOpt = userRepository.findByEmail(loginRequest.getEmail());

        // Updated to getPasswordHash() to match your User model
        if (userOpt.isPresent() && userOpt.get().getPasswordHash().equals(loginRequest.getPasswordHash())) {
            return ResponseEntity.ok(Map.of("message", "Login successful", "userId", userOpt.get().getUserId()));
        }

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Invalid email or password."));
    }

    @GetMapping("/{userId}")
    public ResponseEntity<?> getUserProfile(@PathVariable Integer userId) {
        Optional<User> userOpt = userRepository.findById(userId);

        if (userOpt.isPresent()) {
            User user = userOpt.get();
            // Return only safe data to the frontend
            return ResponseEntity.ok(Map.of(
                    "userId", user.getUserId(),
                    "name", user.getName(),
                    "email", user.getEmail()
            ));
        }

        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "User not found"));
    }

}