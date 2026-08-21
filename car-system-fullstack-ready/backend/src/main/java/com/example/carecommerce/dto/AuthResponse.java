package com.example.carecommerce.dto;
public record AuthResponse(String token, Long id, String name, String email, String role) {}
