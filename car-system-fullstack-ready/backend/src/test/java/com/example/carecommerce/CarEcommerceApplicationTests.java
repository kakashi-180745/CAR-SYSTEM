package com.example.carecommerce;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Map;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(properties = {
    "app.bootstrap.admin-email=admin@test.local",
    "app.bootstrap.admin-password=AdminPass123!",
    "app.admin.signup-code=TESTCODE2026"
})
@AutoConfigureMockMvc
@ActiveProfiles("h2")
class CarEcommerceApplicationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void healthAndPublicCatalogEndpointsWork() throws Exception {
        mockMvc.perform(get("/api/health"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.status").value("UP"));

        mockMvc.perform(get("/api/cars"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].brand").isNotEmpty());

        mockMvc.perform(get("/api/showrooms"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].name").isNotEmpty());

        // /api/auth/me must return 401 when unauthenticated, not 500
        mockMvc.perform(get("/api/auth/me"))
            .andExpect(status().isUnauthorized());
    }

    @Test
    void userSignupProfilePasswordUpdateAndCartFlow() throws Exception {
        String signupJson = objectMapper.writeValueAsString(Map.of(
            "name", "Test Driver",
            "email", "driver@test.local",
            "password", "Password123!",
            "phone", "+91 9876543210"
        ));

        String authRes = mockMvc.perform(post("/api/auth/signup")
                .contentType(MediaType.APPLICATION_JSON)
                .content(signupJson))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.token").isNotEmpty())
            .andReturn().getResponse().getContentAsString();

        String token = objectMapper.readTree(authRes).get("token").asText();

        // Update profile + password (verifying WRITE_ONLY password deserialization works and never leaks in response)
        String updateJson = objectMapper.writeValueAsString(Map.of(
            "name", "Updated Driver",
            "phone", "+91 9999988888",
            "password", "NewPassword456!"
        ));

        mockMvc.perform(put("/api/users/me")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(updateJson))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.name").value("Updated Driver"))
            .andExpect(jsonPath("$.password").doesNotExist());

        // Login with new password succeeds
        String loginJson = objectMapper.writeValueAsString(Map.of(
            "email", "driver@test.local",
            "password", "NewPassword456!"
        ));

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(loginJson))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.token").isNotEmpty());
    }
}
