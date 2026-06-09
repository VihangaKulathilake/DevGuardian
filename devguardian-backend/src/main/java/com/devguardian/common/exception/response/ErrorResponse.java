package com.devguardian.common.exception.response;

import com.devguardian.common.exception.enums.ErrorCode;

import java.time.LocalDateTime;

public record ErrorResponse(

        LocalDateTime timestamp,

        int status,

        String error,

        ErrorCode code,

        String message,

        String path

) {
}