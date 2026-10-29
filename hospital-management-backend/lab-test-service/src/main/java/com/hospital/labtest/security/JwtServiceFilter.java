package com.hospital.labtest.security;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import javax.crypto.SecretKey;
import java.io.IOException;
import java.nio.charset.StandardCharsets;

@Component
public class JwtServiceFilter extends OncePerRequestFilter {
    private final SecretKey secretKey;
    public JwtServiceFilter(@Value("${jwt.secret}") String secret) { secretKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8)); }
    @Override protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain) throws ServletException, IOException {
        if (request.getRequestURI().startsWith("/actuator")) { chain.doFilter(request, response); return; }
        String header = request.getHeader("Authorization");
        if (header == null || !header.startsWith("Bearer ")) { response.sendError(401, "Bearer token is required"); return; }
        try { var claims = Jwts.parser().verifyWith(secretKey).build().parseSignedClaims(header.substring(7)).getPayload();
            if (claims.get("role", String.class) == null || claims.get("userId") == null) { response.sendError(401, "Required JWT claims are missing"); return; }
            chain.doFilter(request, response);
        } catch (RuntimeException exception) { response.sendError(401, "Invalid or expired bearer token"); }
    }
}
