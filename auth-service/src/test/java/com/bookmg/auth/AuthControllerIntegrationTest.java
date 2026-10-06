package com.bookmg.auth;

import com.bookmg.auth.dto.LoginRequest;
import com.bookmg.auth.dto.RegisterRequest;
import com.bookmg.auth.model.Role;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("h2")
class AuthControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("Should successfully register a new user and return JWT token")
    void testRegisterSuccess() throws Exception {
        RegisterRequest request = RegisterRequest.builder()
                .email("newuser@bookmg.com")
                .password("securePassword123")
                .fullName("New Test User")
                .department("ENGINEERING")
                .role(Role.ROLE_EMPLOYEE)
                .build();

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.accessToken").isNotEmpty())
                .andExpect(jsonPath("$.tokenType").value("Bearer"))
                .andExpect(jsonPath("$.user.email").value("newuser@bookmg.com"))
                .andExpect(jsonPath("$.user.fullName").value("New Test User"))
                .andExpect(jsonPath("$.user.role").value("ROLE_EMPLOYEE"))
                .andExpect(jsonPath("$.user.department").value("ENGINEERING"));
    }

    @Test
    @DisplayName("Should reject registration when email already exists")
    void testRegisterDuplicateEmail() throws Exception {
        RegisterRequest request = RegisterRequest.builder()
                .email("admin@bookmg.com") // Already seeded in DataInitializer
                .password("anotherPassword123")
                .fullName("Duplicate Admin")
                .department("IT")
                .build();

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("already exists")));
    }

    @Test
    @DisplayName("Should successfully authenticate seeded admin user and return JWT token")
    void testLoginSuccess() throws Exception {
        LoginRequest request = LoginRequest.builder()
                .email("admin@bookmg.com")
                .password("admin123")
                .build();

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").isNotEmpty())
                .andExpect(jsonPath("$.user.email").value("admin@bookmg.com"))
                .andExpect(jsonPath("$.user.role").value("ROLE_ADMIN"));
    }

    @Test
    @DisplayName("Should reject authentication with invalid password")
    void testLoginInvalidPassword() throws Exception {
        LoginRequest request = LoginRequest.builder()
                .email("admin@bookmg.com")
                .password("wrongPassword!")
                .build();

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Invalid email or password"));
    }

    @Test
    @DisplayName("Should get current user profile with valid Bearer token")
    void testGetCurrentUserWithToken() throws Exception {
        // First login to acquire token
        LoginRequest loginRequest = LoginRequest.builder()
                .email("manager@bookmg.com")
                .password("manager123")
                .build();

        MvcResult loginResult = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andReturn();

        JsonNode responseNode = objectMapper.readTree(loginResult.getResponse().getContentAsString());
        String token = responseNode.get("accessToken").asText();

        // Access /api/v1/auth/me
        mockMvc.perform(get("/api/v1/auth/me")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("manager@bookmg.com"))
                .andExpect(jsonPath("$.fullName").value("Sarah Jenkins"))
                .andExpect(jsonPath("$.role").value("ROLE_MANAGER"))
                .andExpect(jsonPath("$.department").value("ENGINEERING"));
    }

    @Test
    @DisplayName("Should return 401/403 when accessing protected endpoint without token")
    void testProtectedEndpointWithoutToken() throws Exception {
        mockMvc.perform(get("/api/v1/auth/me"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Should filter users by department")
    void testFilterUsersByDepartment() throws Exception {
        // Authenticate as admin
        LoginRequest loginRequest = LoginRequest.builder()
                .email("admin@bookmg.com")
                .password("admin123")
                .build();

        MvcResult loginResult = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andReturn();

        String token = objectMapper.readTree(loginResult.getResponse().getContentAsString()).get("accessToken").asText();

        mockMvc.perform(get("/api/v1/users")
                        .param("department", "ENGINEERING")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(1))))
                .andExpect(jsonPath("$[*].department", everyItem(equalTo("ENGINEERING"))));
    }
}
