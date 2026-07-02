package com.devguardian.security;


import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;

import java.security.Key;
import java.util.Date;
import java.util.Map;
import java.util.function.Function;

@Service
public class JwtService {

    // Get secret key from application.yaml
    @Value("${jwt.secret}")
    private String secretKey;

    // Get signing key
    private Key getSigningKey() {
        return Keys.hmacShaKeyFor(secretKey.getBytes());
    }

    // Generate token
    public String generateToken(Map<String, Object> extraClaims, String userEmail) {
        return Jwts.builder()
                .setClaims(extraClaims)
                .setSubject(userEmail)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + 86400000))
                .signWith(getSigningKey())
                .compact();
    }

    // Generate token (simple version used in AuthServiceImpl)
    public String generateToken(Long userId, String email, String role) {
        return generateToken(Map.of(
                "role", role,
                "userId", userId), email);
    }

    // Extract username (email)
    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    // Extract single claim
    // <T> - Type declaration, T - Return type, Avoids type conflicts
    public <T> T extractClaim(String token, Function<Claims, T> resolver) {
        Claims claims = extractAllClaims(token);
        return resolver.apply(claims);
    }

    // Extract all claims
    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    // Check if token is valid
    public boolean isTokenValid(String token, String email) {
        String username = extractUsername(token);
        return username.equals(email) && !isTokenExpired(token);
    }

    // Check expiration
    private boolean isTokenExpired(String token) {
        return extractClaim(token, Claims::getExpiration).before(new Date());
    }
}
