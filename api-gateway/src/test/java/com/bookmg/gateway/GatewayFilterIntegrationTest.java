package com.bookmg.gateway;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpHeaders;
import org.springframework.test.web.reactive.server.WebTestClient;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class GatewayFilterIntegrationTest {

    @Autowired
    private WebTestClient webTestClient;

    @Value("${jwt.secret:404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970}")
    private String jwtSecret;

    private String validToken;

    @BeforeEach
    void setup() {
        byte[] keyBytes;
        try {
            keyBytes = Decoders.BASE64.decode(jwtSecret);
        } catch (Exception e) {
            keyBytes = jwtSecret.getBytes(StandardCharsets.UTF_8);
        }
        SecretKey key = Keys.hmacShaKeyFor(keyBytes);

        validToken = Jwts.builder()
                .subject("test@bookmg.com")
                .claim("userId", 100L)
                .claim("role", "ROLE_EMPLOYEE")
                .claim("department", "ENGINEERING")
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + 3600000))
                .signWith(key)
                .compact();
    }

    @Test
    @DisplayName("Gateway: Should reject protected route when Authorization header is missing (401)")
    void testProtectedRouteWithoutToken() {
        webTestClient.get()
                .uri("/api/v1/bookings/my")
                .exchange()
                .expectStatus().isUnauthorized();
    }

    @Test
    @DisplayName("Gateway: Should reject protected route when token is invalid or corrupted (401)")
    void testProtectedRouteWithInvalidToken() {
        webTestClient.get()
                .uri("/api/v1/bookings/my")
                .header(HttpHeaders.AUTHORIZATION, "Bearer invalid.jwt.token")
                .exchange()
                .expectStatus().isUnauthorized();
    }

    @Test
    @DisplayName("Gateway: Actuator health endpoint should be publicly accessible")
    void testActuatorHealth() {
        webTestClient.get()
                .uri("/actuator/health")
                .exchange()
                .expectStatus().isOk();
    }
}
