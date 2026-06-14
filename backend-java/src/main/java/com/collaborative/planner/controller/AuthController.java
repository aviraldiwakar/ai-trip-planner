package com.collaborative.planner.controller;

import com.collaborative.planner.model.User;
import com.collaborative.planner.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*") // Allow frontend integration
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    public static class authRequest {
        private String name;
        private String email;
        private String password;

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody authRequest req) {
        if (req.getEmail() == null || req.getEmail().trim().isEmpty() ||
            req.getPassword() == null || req.getPassword().trim().isEmpty() ||
            req.getName() == null || req.getName().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "All registration fields are required."));
        }

        if (userRepository.existsByEmail(req.getEmail())) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("message", "An account with that email has already registered."));
        }

        // Ideally, encode password using BCryptPasswordEncoder. Simple pseudo-hashed password here for standalone operation.
        String hashed = "sha256_" + Integer.toHexString(req.getPassword().hashCode());
        
        User newUser = new User(null, req.getName().trim(), req.getEmail().trim().toLowerCase(), hashed);
        User saved = userRepository.save(newUser);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "User registered successfully");
        response.put("userId", saved.getUserId());
        response.put("name", saved.getName());
        response.put("email", saved.getEmail());
        
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody authRequest req) {
        if (req.getEmail() == null || req.getEmail().trim().isEmpty() ||
            req.getPassword() == null || req.getPassword().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email and password are required."));
        }

        Optional<User> userOpt = userRepository.findByEmail(req.getEmail().trim().toLowerCase());
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Invalid email credentials."));
        }

        User user = userOpt.get();
        String hashed = "sha256_" + Integer.toHexString(req.getPassword().hashCode());

        if (!user.getPasswordHash().equals(hashed)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Incorrect password credentials."));
        }

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Authentication successful");
        response.put("userId", user.getUserId());
        response.put("name", user.getName());
        response.put("email", user.getEmail());

        return ResponseEntity.ok(response);
    }
}
