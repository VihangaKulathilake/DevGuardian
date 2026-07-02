package com.devguardian.security.handler;

import com.devguardian.common.exception.enums.ErrorCode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Map;

@Component
public class JwtAuthenticationEntryPoint implements AuthenticationEntryPoint {

    private final ObjectMapper objectMapper;

    public JwtAuthenticationEntryPoint(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    @Override
    public void commence(
            HttpServletRequest request,
            HttpServletResponse response,
            AuthenticationException authException
    ) throws IOException, ServletException {

        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("application/json");

        Map<String, Object> errorResponse = Map.of(
                "timestamp", LocalDateTime.now().toString(),
                "status", HttpStatus.UNAUTHORIZED.value(),
                "error", HttpStatus.UNAUTHORIZED.getReasonPhrase(),
                "code", ErrorCode.UNAUTHORIZED.name(),
                "message", "Authentication required",
                "path", request.getRequestURI()
        );

        objectMapper.writeValue(
                response.getOutputStream(),
                errorResponse
        );
    }
}