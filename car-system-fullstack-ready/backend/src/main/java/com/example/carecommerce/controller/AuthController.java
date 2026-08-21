package com.example.carecommerce.controller;

import com.example.carecommerce.dto.*;
import com.example.carecommerce.model.User;
import com.example.carecommerce.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletRequest;

@RestController @RequestMapping("/api/auth")
public class AuthController {
    private final AuthService service;
    private final com.example.carecommerce.security.AuthRateLimiter rateLimiter;
    public AuthController(AuthService service, com.example.carecommerce.security.AuthRateLimiter rateLimiter){this.service=service;this.rateLimiter=rateLimiter;}
    @PostMapping("/signup") public ResponseEntity<AuthResponse> signup(@Valid @RequestBody SignupRequest req, HttpServletRequest request){checkRateLimit(request, "signup"); return ResponseEntity.ok(service.signup(req));}
    @PostMapping("/admin-signup") public ResponseEntity<AuthResponse> adminSignup(@Valid @RequestBody AdminSignupRequest req, HttpServletRequest request){checkRateLimit(request, "admin-signup"); return ResponseEntity.ok(service.adminSignup(req));}
    @PostMapping("/login") public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest req, HttpServletRequest request){checkRateLimit(request, "login"); return ResponseEntity.ok(service.login(req));}
    @GetMapping("/me") public ResponseEntity<User> me(Authentication auth){return ResponseEntity.ok(service.getMe(auth.getName()));}

    private void checkRateLimit(HttpServletRequest request, String action) {
        String ip = request.getRemoteAddr();
        if (!rateLimiter.allow(action + ":" + ip)) {
            throw new org.springframework.web.server.ResponseStatusException(
                org.springframework.http.HttpStatus.TOO_MANY_REQUESTS,
                "Too many authentication attempts. Please try again later."
            );
        }
    }
}
