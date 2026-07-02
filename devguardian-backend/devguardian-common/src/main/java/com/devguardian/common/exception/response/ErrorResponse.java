package com.devguardian.common.exception.response;

import com.devguardian.common.exception.enums.ErrorCode;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;

@Schema(description = "Standard enterprise-grade API Error Response payload")
public record ErrorResponse(

        @Schema(description = "Timestamp when the error occurred", example = "2026-06-13T20:16:31")
        LocalDateTime timestamp,

        @Schema(description = "HTTP status code representing the error", example = "404")
        int status,

        @Schema(description = "Standard HTTP error phrase matching status code", example = "Not Found")
        String error,

        @Schema(description = "Internal application-specific error code", example = "RESOURCE_NOT_FOUND")
        ErrorCode code,

        @Schema(description = "Human-readable error details and messages", example = "Repository Not Found")
        String message,

        @Schema(description = "The request endpoint path triggered by the error", example = "/api/repositories/1")
        String path

) {
}