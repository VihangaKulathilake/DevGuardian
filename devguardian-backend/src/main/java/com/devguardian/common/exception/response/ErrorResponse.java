package com.devguardian.common.exception.response;

import com.devguardian.common.exception.enums.ErrorCode;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;

@Schema(description = "Standard API Error Response")

public record ErrorResponse(

        LocalDateTime timestamp,

        @Schema(example = "404")
        int status,

        String error,

        ErrorCode code,

        @Schema(example = "Repository Not Found")
        String message,

        String path

) {
}