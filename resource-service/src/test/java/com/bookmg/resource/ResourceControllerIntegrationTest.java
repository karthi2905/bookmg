package com.bookmg.resource;

import com.bookmg.resource.dto.CreateResourceRequest;
import com.bookmg.resource.dto.UpdateResourceRequest;
import com.bookmg.resource.model.ResourceType;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.Set;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("h2")
class ResourceControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Value("${jwt.secret:404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970}")
    private String jwtSecret;

    private String adminToken;
    private String employeeToken;

    @BeforeEach
    void setupTokens() {
        adminToken = generateToken("admin@bookmg.com", "ROLE_ADMIN");
        employeeToken = generateToken("employee@bookmg.com", "ROLE_EMPLOYEE");
    }

    private String generateToken(String email, String role) {
        byte[] keyBytes;
        try {
            keyBytes = Decoders.BASE64.decode(jwtSecret);
        } catch (Exception e) {
            keyBytes = jwtSecret.getBytes(StandardCharsets.UTF_8);
        }
        SecretKey key = Keys.hmacShaKeyFor(keyBytes);

        return Jwts.builder()
                .subject(email)
                .claim("role", role)
                .claim("userId", 1L)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + 3600000))
                .signWith(key)
                .compact();
    }

    @Test
    @DisplayName("Should list all seeded resources without requiring authentication")
    void testGetAllResources() throws Exception {
        mockMvc.perform(get("/api/v1/resources"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(8))))
                .andExpect(jsonPath("$[*].name", hasItem("Executive Boardroom Alpha")));
    }

    @Test
    @DisplayName("Should filter resources by type LAB")
    void testFilterByType() throws Exception {
        mockMvc.perform(get("/api/v1/resources")
                        .param("type", "LAB"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(2))))
                .andExpect(jsonPath("$[*].type", everyItem(equalTo("LAB"))));
    }

    @Test
    @DisplayName("Should filter resources with minimum capacity >= 20")
    void testFilterByCapacity() throws Exception {
        mockMvc.perform(get("/api/v1/resources")
                        .param("minCapacity", "20"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(2))))
                .andExpect(jsonPath("$[*].capacity", everyItem(greaterThanOrEqualTo(20))));
    }

    @Test
    @DisplayName("Should filter restricted resources")
    void testFilterByRestricted() throws Exception {
        mockMvc.perform(get("/api/v1/resources")
                        .param("restricted", "true"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[*].restricted", everyItem(equalTo(true))));
    }

    @Test
    @DisplayName("Should filter resources by feature '3D Printers'")
    void testFilterByFeature() throws Exception {
        mockMvc.perform(get("/api/v1/resources")
                        .param("feature", "3D Printers"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(1))))
                .andExpect(jsonPath("$[*].name", hasItem("Hardware Prototyping Lab")));
    }

    @Test
    @DisplayName("Should search resources by keyword 'laser'")
    void testSearchKeyword() throws Exception {
        mockMvc.perform(get("/api/v1/resources")
                        .param("search", "laser"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].name").value("Sony 4K Laser Cinema Projector"));
    }

    @Test
    @DisplayName("Should allow Admin to create a new resource")
    void testCreateResourceAsAdmin() throws Exception {
        CreateResourceRequest request = CreateResourceRequest.builder()
                .name("UX Usability Suite")
                .type(ResourceType.LAB)
                .capacity(8)
                .location("Design Wing, 2nd Floor")
                .restricted(false)
                .description("One-way observation mirror and eye-tracking lab.")
                .features(Set.of("Eye Tracker", "One-Way Mirror", "Observation Deck"))
                .build();

        mockMvc.perform(post("/api/v1/resources")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNotEmpty())
                .andExpect(jsonPath("$.name").value("UX Usability Suite"))
                .andExpect(jsonPath("$.features", hasItem("Eye Tracker")));
    }

    @Test
    @DisplayName("Should forbid Employee from creating resources (403 Forbidden)")
    void testCreateResourceForbiddenForEmployee() throws Exception {
        CreateResourceRequest request = CreateResourceRequest.builder()
                .name("Unauthorized Room")
                .type(ResourceType.MEETING_ROOM)
                .capacity(4)
                .location("Basement")
                .restricted(false)
                .build();

        mockMvc.perform(post("/api/v1/resources")
                        .header("Authorization", "Bearer " + employeeToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Should allow Admin to update an existing resource")
    void testUpdateResource() throws Exception {
        // Fetch Innovation Huddle 1
        MvcResult listResult = mockMvc.perform(get("/api/v1/resources")
                        .param("search", "Innovation Huddle 1"))
                .andExpect(status().isOk())
                .andReturn();

        JsonNode listNode = objectMapper.readTree(listResult.getResponse().getContentAsString());
        long resourceId = listNode.get(0).get("id").asLong();

        UpdateResourceRequest updateRequest = UpdateResourceRequest.builder()
                .capacity(10)
                .location("Building B, Floor 2, Room 201")
                .build();

        mockMvc.perform(put("/api/v1/resources/" + resourceId)
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.capacity").value(10))
                .andExpect(jsonPath("$.location").value("Building B, Floor 2, Room 201"));
    }

    @Test
    @DisplayName("Should soft delete a resource (active set to false)")
    void testDeleteResource() throws Exception {
        // Create a temporary resource to delete
        CreateResourceRequest createRequest = CreateResourceRequest.builder()
                .name("Temporary Meeting Pod")
                .type(ResourceType.MEETING_ROOM)
                .capacity(2)
                .location("Hallway Pod 5")
                .restricted(false)
                .build();

        MvcResult createResult = mockMvc.perform(post("/api/v1/resources")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createRequest)))
                .andExpect(status().isCreated())
                .andReturn();

        long createdId = objectMapper.readTree(createResult.getResponse().getContentAsString()).get("id").asLong();

        // Delete (soft delete)
        mockMvc.perform(delete("/api/v1/resources/" + createdId)
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isNoContent());

        // Verify active=false
        mockMvc.perform(get("/api/v1/resources/" + createdId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.active").value(false));
    }
}
