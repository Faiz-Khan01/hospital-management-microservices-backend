package com.hospital.apigateway.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.core.Ordered;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import reactor.core.publisher.Mono;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Set;

@Component
public class GatewayAuthorizationFilter implements GlobalFilter, Ordered {

    private static final Set<String> PUBLIC_PATHS = Set.of(
            "/api/v1/auth/login",
            "/api/v1/auth/register",
            "/api/v1/auth/forgot-password",
            "/api/v1/auth/reset-password"
    );

    private final SecretKey secretKey;

    public GatewayAuthorizationFilter(@Value("${jwt.secret}") String secret) {
        this.secretKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        String path = exchange.getRequest().getPath().value();
        if (PUBLIC_PATHS.contains(path) || isPreflight(exchange.getRequest())) {
            return chain.filter(exchange);
        }

        String token = extractToken(exchange.getRequest());
        if (token == null) {
            return reject(exchange, HttpStatus.UNAUTHORIZED);
        }

        Claims claims;
        try {
            claims = Jwts.parser().verifyWith(secretKey).build().parseSignedClaims(token).getPayload();
        } catch (RuntimeException exception) {
            return reject(exchange, HttpStatus.UNAUTHORIZED);
        }

        String role = claims.get("role", String.class);
        if (!isAllowed(path, exchange.getRequest().getMethod().name(), role)) {
            return reject(exchange, HttpStatus.FORBIDDEN);
        }

        ServerHttpRequest authenticatedRequest = exchange.getRequest().mutate()
                .header("X-Authenticated-User", claims.getSubject())
                .header("X-Authenticated-Role", role)
                .header("X-Authenticated-User-Id", String.valueOf(claims.get("userId")))
                .build();
        return chain.filter(exchange.mutate().request(authenticatedRequest).build());
    }

    boolean isAllowed(String path, String method, String role) {
        if (role == null) {
            return false;
        }
        role = role.replace("ROLE_", "").toUpperCase();
        if ("ADMIN".equals(role)) {
            return true;
        }
        if (path.startsWith("/api/v1/auth/") || path.startsWith("/api/v1/users")
                || path.startsWith("/api/v1/roles") || path.startsWith("/api/v1/departments")) {
            return false;
        }
        if (path.startsWith("/api/v1/notifications")) {
            return true;
        }
        if (path.startsWith("/api/v1/payments") || path.startsWith("/api/v1/billing")) {
            return Set.of("PATIENT", "ACCOUNTANT", "RECEPTIONIST").contains(role)
                    && ("GET".equals(method) || "POST".equals(method));
        }
        if (path.startsWith("/api/v1/pharmacy") || path.startsWith("/api/v1/medicines")) {
            return Set.of("PHARMACIST", "DOCTOR").contains(role);
        }
        if (path.startsWith("/api/v1/lab")) {
            return Set.of("DOCTOR", "NURSE", "LAB_TECHNICIAN", "PATIENT").contains(role);
        }
        if (path.startsWith("/api/v1/medical-records") || path.startsWith("/api/v1/prescriptions")) {
            return Set.of("DOCTOR", "NURSE", "PATIENT").contains(role);
        }
        if (path.startsWith("/api/v1/patients") || path.startsWith("/api/v1/beds")
                || path.startsWith("/api/v1/admissions")) {
            return Set.of("DOCTOR", "NURSE", "RECEPTIONIST", "PATIENT").contains(role);
        }
        if (path.startsWith("/api/v1/doctors") || path.startsWith("/api/v1/appointments")) {
            return Set.of("DOCTOR", "NURSE", "RECEPTIONIST", "PATIENT").contains(role);
        }
        return false;
    }

    private String extractToken(ServerHttpRequest request) {
        String header = request.getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
        return header != null && header.startsWith("Bearer ") ? header.substring(7) : null;
    }

    private boolean isPreflight(ServerHttpRequest request) {
        return "OPTIONS".equals(request.getMethod().name());
    }

    private Mono<Void> reject(ServerWebExchange exchange, HttpStatus status) {
        exchange.getResponse().setStatusCode(status);
        return exchange.getResponse().setComplete();
    }

    @Override
    public int getOrder() {
        return -100;
    }
}
