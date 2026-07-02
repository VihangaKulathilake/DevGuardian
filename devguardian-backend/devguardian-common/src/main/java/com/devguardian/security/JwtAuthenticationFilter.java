package com.devguardian.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        // Get Authorization header
        final String authHeader = request.getHeader("Authorization");

        // Skip if no token
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        // Extract token
        String jwt = authHeader.substring(7);

        // Extract claims from token
        String email = null;
        Long userId = null;
        String role = null;

        try {
            email = jwtService.extractUsername(jwt);
            Object userIdObj = jwtService.extractClaim(jwt, claims -> claims.get("userId"));
            if (userIdObj instanceof Number) {
                userId = ((Number) userIdObj).longValue();
            } else if (userIdObj instanceof String) {
                userId = Long.parseLong((String) userIdObj);
            }
            role = jwtService.extractClaim(jwt, claims -> claims.get("role", String.class));
        } catch (Exception e) {
            // Token is invalid, expired or malformed.
        }

        // Authenticate only if not already authenticated
        if (email != null &&
                SecurityContextHolder.getContext().getAuthentication() == null) {

            // Validate token
            if (jwtService.isTokenValid(jwt, email)) {
                StatelessUser userDetails = new StatelessUser(userId, email, role);

                UsernamePasswordAuthenticationToken authToken =
                        new UsernamePasswordAuthenticationToken(
                                userDetails,
                                null,
                                userDetails.getAuthorities()
                        );

                authToken.setDetails(
                        new WebAuthenticationDetailsSource()
                                .buildDetails(request)
                );

                SecurityContextHolder.getContext()
                        .setAuthentication(authToken);
            }
        }

        filterChain.doFilter(request, response);
    }
}
