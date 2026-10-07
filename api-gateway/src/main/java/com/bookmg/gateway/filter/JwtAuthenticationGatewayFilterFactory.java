package com.bookmg.gateway.filter;

import com.bookmg.gateway.security.JwtTokenValidator;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.nio.charset.StandardCharsets;

@Slf4j
@Component
public class JwtAuthenticationGatewayFilterFactory
        extends AbstractGatewayFilterFactory<JwtAuthenticationGatewayFilterFactory.Config> {

    private final JwtTokenValidator jwtTokenValidator;

    public JwtAuthenticationGatewayFilterFactory(JwtTokenValidator jwtTokenValidator) {
        super(Config.class);
        this.jwtTokenValidator = jwtTokenValidator;
    }

    @Override
    public GatewayFilter apply(Config config) {
        return (exchange, chain) -> {
            ServerHttpRequest request = exchange.getRequest();

            if (!request.getHeaders().containsKey(HttpHeaders.AUTHORIZATION)) {
                log.warn("Gateway: Missing Authorization header on request to {}", request.getURI().getPath());
                return onError(exchange, "Authorization header is missing", HttpStatus.UNAUTHORIZED);
            }

            String authHeader = request.getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
            if (!StringUtils.hasText(authHeader) || !authHeader.startsWith("Bearer ")) {
                log.warn("Gateway: Invalid Bearer token format on request to {}", request.getURI().getPath());
                return onError(exchange, "Invalid Authorization header format", HttpStatus.UNAUTHORIZED);
            }

            String token = authHeader.substring(7);
            if (!jwtTokenValidator.validateToken(token)) {
                log.warn("Gateway: Invalid or expired JWT token on request to {}", request.getURI().getPath());
                return onError(exchange, "JWT token is expired or invalid", HttpStatus.UNAUTHORIZED);
            }

            String email = jwtTokenValidator.getEmail(token);
            String role = jwtTokenValidator.getRole(token);
            String userId = jwtTokenValidator.getUserId(token);
            String department = jwtTokenValidator.getDepartment(token);

            ServerHttpRequest.Builder builder = request.mutate();
            if (email != null) builder.header("X-User-Email", email);
            if (role != null) builder.header("X-User-Role", role);
            if (userId != null) builder.header("X-User-Id", userId);
            if (department != null) builder.header("X-User-Department", department);

            return chain.filter(exchange.mutate().request(builder.build()).build());
        };
    }

    private Mono<Void> onError(ServerWebExchange exchange, String err, HttpStatus httpStatus) {
        ServerHttpResponse response = exchange.getResponse();
        response.setStatusCode(httpStatus);
        response.getHeaders().setContentType(MediaType.APPLICATION_JSON);

        String jsonError = String.format("{\"status\":%d,\"error\":\"%s\",\"message\":\"%s\"}",
                httpStatus.value(), httpStatus.getReasonPhrase(), err);
        byte[] bytes = jsonError.getBytes(StandardCharsets.UTF_8);
        DataBuffer buffer = response.bufferFactory().wrap(bytes);

        return response.writeWith(Mono.just(buffer));
    }

    @Data
    public static class Config {
        // Optional configuration properties if needed
        private boolean enabled = true;
    }
}
