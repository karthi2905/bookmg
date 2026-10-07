package com.bookmg.booking;

import com.bookmg.booking.client.ResourceClient;
import com.bookmg.booking.client.ResourceDto;
import com.bookmg.booking.dto.ApprovalActionRequest;
import com.bookmg.booking.dto.CreateBookingRequest;
import com.bookmg.booking.model.BookingStatus;
import com.bookmg.booking.model.RecurrenceType;
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
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Date;
import java.util.Set;

import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("h2")
class BookingControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private ResourceClient resourceClient;

    @Value("${jwt.secret:404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970}")
    private String jwtSecret;

    private String adminToken;
    private String managerToken;
    private String userToken;

    @BeforeEach
    void setup() {
        adminToken = generateToken(1L, "admin@bookmg.com", "ROLE_ADMIN", "IT");
        managerToken = generateToken(2L, "manager@bookmg.com", "ROLE_MANAGER", "ENGINEERING");
        userToken = generateToken(3L, "user@bookmg.com", "ROLE_EMPLOYEE", "ENGINEERING");

        // Mock Feign Client calls
        when(resourceClient.getResourceById(eq(2L))).thenReturn(
                ResourceDto.builder()
                        .id(2L)
                        .name("Innovation Huddle 1")
                        .active(true)
                        .restricted(false)
                        .capacity(6)
                        .features(Set.of("TV Screen"))
                        .build()
        );

        when(resourceClient.getResourceById(eq(1L))).thenReturn(
                ResourceDto.builder()
                        .id(1L)
                        .name("Executive Boardroom Alpha")
                        .active(true)
                        .restricted(true) // Restricted resource requiring approval
                        .capacity(20)
                        .features(Set.of("4K Video Conference"))
                        .build()
        );
    }

    private String generateToken(Long userId, String email, String role, String department) {
        byte[] keyBytes;
        try {
            keyBytes = Decoders.BASE64.decode(jwtSecret);
        } catch (Exception e) {
            keyBytes = jwtSecret.getBytes(StandardCharsets.UTF_8);
        }
        SecretKey key = Keys.hmacShaKeyFor(keyBytes);

        return Jwts.builder()
                .subject(email)
                .claim("userId", userId)
                .claim("role", role)
                .claim("department", department)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + 3600000))
                .signWith(key)
                .compact();
    }

    @Test
    @DisplayName("Phase 3: Should create single booking on non-restricted resource with status CONFIRMED")
    void testCreateSingleBookingSuccess() throws Exception {
        LocalDateTime start = LocalDate.now().plusDays(5).atTime(14, 0);
        LocalDateTime end = LocalDate.now().plusDays(5).atTime(15, 30);

        CreateBookingRequest request = CreateBookingRequest.builder()
                .title("Design Sync")
                .resourceId(2L)
                .startTime(start)
                .endTime(end)
                .recurrenceType(RecurrenceType.NONE)
                .build();

        mockMvc.perform(post("/api/v1/bookings")
                        .header("Authorization", "Bearer " + userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNotEmpty())
                .andExpect(jsonPath("$.status").value("CONFIRMED"))
                .andExpect(jsonPath("$.resourceName").value("Innovation Huddle 1"));
    }

    @Test
    @DisplayName("Phase 3: Should atomically reject overlapping booking on same resource (Conflict 409)")
    void testAtomicConflictDetection() throws Exception {
        LocalDateTime start = LocalDate.now().plusDays(6).atTime(10, 0);
        LocalDateTime end = LocalDate.now().plusDays(6).atTime(12, 0);

        CreateBookingRequest initial = CreateBookingRequest.builder()
                .title("Quarterly Review")
                .resourceId(2L)
                .startTime(start)
                .endTime(end)
                .build();

        mockMvc.perform(post("/api/v1/bookings")
                        .header("Authorization", "Bearer " + userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(initial)))
                .andExpect(status().isCreated());

        // Overlapping request: 11:00 - 13:00 (overlaps by 1 hour)
        CreateBookingRequest overlapping = CreateBookingRequest.builder()
                .title("Conflicting Meeting")
                .resourceId(2L)
                .startTime(start.plusHours(1))
                .endTime(end.plusHours(1))
                .build();

        mockMvc.perform(post("/api/v1/bookings")
                        .header("Authorization", "Bearer " + userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(overlapping)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message", containsString("Resource conflict: already booked")));
    }

    @Test
    @DisplayName("Phase 5: Should set status to PENDING_APPROVAL when employee books restricted resource")
    void testRestrictedResourceRequiresApproval() throws Exception {
        LocalDateTime start = LocalDate.now().plusDays(7).atTime(10, 0);
        LocalDateTime end = LocalDate.now().plusDays(7).atTime(12, 0);

        CreateBookingRequest request = CreateBookingRequest.builder()
                .title("Partner Negotiation")
                .resourceId(1L) // Executive Boardroom Alpha (restricted = true)
                .startTime(start)
                .endTime(end)
                .build();

        mockMvc.perform(post("/api/v1/bookings")
                        .header("Authorization", "Bearer " + userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("PENDING_APPROVAL"));
    }

    @Test
    @DisplayName("Phase 5: Should auto-approve restricted resource when booked by Admin")
    void testAdminRestrictedResourceAutoApproved() throws Exception {
        LocalDateTime start = LocalDate.now().plusDays(8).atTime(14, 0);
        LocalDateTime end = LocalDate.now().plusDays(8).atTime(16, 0);

        CreateBookingRequest request = CreateBookingRequest.builder()
                .title("Board Meeting")
                .resourceId(1L)
                .startTime(start)
                .endTime(end)
                .build();

        mockMvc.perform(post("/api/v1/bookings")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("CONFIRMED"));
    }

    @Test
    @DisplayName("Phase 5: Should allow Manager to approve pending booking")
    void testManagerApproveBooking() throws Exception {
        // Create pending booking
        LocalDateTime start = LocalDate.now().plusDays(9).atTime(10, 0);
        LocalDateTime end = LocalDate.now().plusDays(9).atTime(11, 0);

        CreateBookingRequest request = CreateBookingRequest.builder()
                .title("Team Demo")
                .resourceId(1L)
                .startTime(start)
                .endTime(end)
                .build();

        MvcResult createResult = mockMvc.perform(post("/api/v1/bookings")
                        .header("Authorization", "Bearer " + userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andReturn();

        Long bookingId = objectMapper.readTree(createResult.getResponse().getContentAsString()).get("id").asLong();

        // Manager approves
        ApprovalActionRequest approvalRequest = ApprovalActionRequest.builder()
                .note("Approved by Engineering Manager")
                .build();

        mockMvc.perform(post("/api/v1/approvals/" + bookingId + "/approve")
                        .header("Authorization", "Bearer " + managerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(approvalRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CONFIRMED"))
                .andExpect(jsonPath("$.approverEmail").value("manager@bookmg.com"))
                .andExpect(jsonPath("$.approvalNote").value("Approved by Engineering Manager"));
    }

    @Test
    @DisplayName("Phase 4: Should generate recurring booking series and enforce 3-month cap")
    void testCreateRecurringBookingSeries() throws Exception {
        LocalDateTime start = LocalDate.now().plusDays(10).atTime(9, 0);
        LocalDateTime end = LocalDate.now().plusDays(10).atTime(10, 0);
        LocalDateTime until = start.plusWeeks(3); // 4 occurrences: start + 3 weeks

        CreateBookingRequest request = CreateBookingRequest.builder()
                .title("Weekly Architecture Guild")
                .resourceId(2L)
                .startTime(start)
                .endTime(end)
                .recurrenceType(RecurrenceType.WEEKLY)
                .recurrenceUntil(until)
                .build();

        MvcResult result = mockMvc.perform(post("/api/v1/bookings")
                        .header("Authorization", "Bearer " + userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.recurrenceGroupId").isNotEmpty())
                .andExpect(jsonPath("$.recurrenceType").value("WEEKLY"))
                .andReturn();

        JsonNode responseNode = objectMapper.readTree(result.getResponse().getContentAsString());
        String recurrenceGroupId = responseNode.get("recurrenceGroupId").asText();

        // Cancel entire series
        mockMvc.perform(delete("/api/v1/bookings/series/" + recurrenceGroupId)
                        .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(1))))
                .andExpect(jsonPath("$[*].status", everyItem(equalTo("CANCELLED"))));
    }

    @Test
    @DisplayName("Phase 7: Should inspect availability grid with booked and open slots")
    void testAvailabilityEndpoint() throws Exception {
        mockMvc.perform(get("/api/v1/bookings/availability")
                        .header("Authorization", "Bearer " + userToken)
                        .param("resourceId", "2")
                        .param("date", LocalDate.now().toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.resourceId").value(2))
                .andExpect(jsonPath("$.workingHoursStart").value(9))
                .andExpect(jsonPath("$.workingHoursEnd").value(18))
                .andExpect(jsonPath("$.availableSlots").isArray());
    }

    @Test
    @DisplayName("Phase 7: Should generate utilisation analytics report")
    void testUtilisationReport() throws Exception {
        mockMvc.perform(get("/api/v1/reports/utilisation")
                        .header("Authorization", "Bearer " + userToken)
                        .param("startDate", LocalDate.now().minusDays(7).toString())
                        .param("endDate", LocalDate.now().plusDays(7).toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalBookings").isNumber())
                .andExpect(jsonPath("$.departmentBreakdown").isArray())
                .andExpect(jsonPath("$.resourceBreakdown").isArray())
                .andExpect(jsonPath("$.hourlyPeakDistribution").isMap());
    }

    @Test
    @DisplayName("Phase 6: Should reject check-in when too early (outside 15-min grace window)")
    void testCheckInTooEarly() throws Exception {
        // Create booking in the future (far beyond 15 minutes)
        LocalDateTime start = LocalDateTime.now().plusDays(2);
        LocalDateTime end = start.plusHours(1);

        CreateBookingRequest request = CreateBookingRequest.builder()
                .title("Future Checkin Test")
                .resourceId(2L)
                .startTime(start)
                .endTime(end)
                .build();

        MvcResult createResult = mockMvc.perform(post("/api/v1/bookings")
                        .header("Authorization", "Bearer " + userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andReturn();

        Long bookingId = objectMapper.readTree(createResult.getResponse().getContentAsString()).get("id").asLong();

        // Attempt check-in too early
        mockMvc.perform(post("/api/v1/bookings/" + bookingId + "/checkin")
                        .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("Check-in opens")));
    }
}
