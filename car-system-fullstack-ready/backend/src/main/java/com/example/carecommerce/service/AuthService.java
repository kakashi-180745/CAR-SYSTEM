package com.example.carecommerce.service;

import com.example.carecommerce.dto.*;
import com.example.carecommerce.model.User;
import com.example.carecommerce.repository.UserRepository;
import com.example.carecommerce.security.JwtService;
import org.springframework.security.authentication.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;

@Service
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    @Value("${app.admin.signup-code:}") private String adminSignupCode;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder,
                       AuthenticationManager authenticationManager, JwtService jwtService) {
        this.userRepository=userRepository; this.passwordEncoder=passwordEncoder;
        this.authenticationManager=authenticationManager; this.jwtService=jwtService;
    }

    public AuthResponse signup(SignupRequest request) {
        if(userRepository.existsByEmailIgnoreCase(request.email()))
            throw new IllegalArgumentException("An account already exists with this email.");
        User user=new User(request.name().trim(),request.email().trim().toLowerCase(),
            passwordEncoder.encode(request.password()),"USER");
        user.setPhone(request.phone().trim());
        userRepository.save(user);
        return new AuthResponse(jwtService.generateToken(user.getEmail(),user.getRole()),
            user.getId(),user.getName(),user.getEmail(),user.getRole());
    }

    public AuthResponse login(LoginRequest request) {
        Authentication authentication=authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(request.email().trim().toLowerCase(),request.password()));
        User user=userRepository.findByEmailIgnoreCase(authentication.getName())
            .orElseThrow(()->new IllegalArgumentException("User not found."));
        return new AuthResponse(jwtService.generateToken(user.getEmail(),user.getRole()),
            user.getId(),user.getName(),user.getEmail(),user.getRole());
    }

    public AuthResponse adminSignup(AdminSignupRequest request) {
        if(adminSignupCode == null || adminSignupCode.isBlank())
            throw new IllegalArgumentException("Admin registration is disabled.");
        if(!request.signupCode().equals(adminSignupCode))
            throw new IllegalArgumentException("Invalid admin registration code.");
        if(userRepository.existsByEmailIgnoreCase(request.email()))
            throw new IllegalArgumentException("An account already exists with this email.");
        User user=new User(request.name().trim(),request.email().trim().toLowerCase(),passwordEncoder.encode(request.password()),"ADMIN");
        userRepository.save(user);
        return new AuthResponse(jwtService.generateToken(user.getEmail(),user.getRole()),user.getId(),user.getName(),user.getEmail(),user.getRole());
    }

    public User getMe(String email) {
        return userRepository.findByEmailIgnoreCase(email)
            .orElseThrow(()->new IllegalArgumentException("User not found."));
    }
}
