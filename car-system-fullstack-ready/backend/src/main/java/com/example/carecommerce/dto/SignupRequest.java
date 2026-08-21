package com.example.carecommerce.dto;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
public record SignupRequest(
    @NotBlank @Size(min=2,max=100) String name,
    @NotBlank @Email @Size(max=160) String email,
    @NotBlank @Size(min=8,max=72) String password,
    @NotBlank @Size(min=7,max=20) @Pattern(regexp="^[0-9+()\\- ]+$", message="Enter a valid phone number") String phone
) {}
