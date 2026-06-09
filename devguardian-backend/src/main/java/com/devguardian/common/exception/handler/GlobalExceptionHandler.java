package com.devguardian.common.exception.handler;

import com.devguardian.common.exception.custom.BusinessException;
import com.devguardian.common.exception.custom.ResourceNotFoundException;
import com.devguardian.common.exception.enums.ErrorCode;
import com.devguardian.common.exception.response.ErrorResponse;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ErrorResponse> handleAuthenticationException(
            AuthenticationException ex,
            HttpServletRequest request
    ) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(buildError(
                        HttpStatus.UNAUTHORIZED,
                        ErrorCode.UNAUTHORIZED,
                        ex.getMessage(),
                        request
                ));
    }
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(
            ResourceNotFoundException ex,
            HttpServletRequest request
    ) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(buildError(
                        HttpStatus.NOT_FOUND,
                        ErrorCode.RESOURCE_NOT_FOUND,
                        ex.getMessage(),
                        request
                ));
    }

    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ErrorResponse> handleBusinessException(
            BusinessException ex,
            HttpServletRequest request
    ) {
        return ResponseEntity.badRequest()
                .body(buildError(
                        HttpStatus.BAD_REQUEST,
                        ErrorCode.BUSINESS_ERROR,
                        ex.getMessage(),
                        request
                ));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(
            MethodArgumentNotValidException ex,
            HttpServletRequest request
    ) {

        String message = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(err -> err.getField() + ": " + err.getDefaultMessage())
                .reduce((a, b) -> a + ", " + b)
                .orElse("Validation error");

        return ResponseEntity.badRequest()
                .body(buildError(
                        HttpStatus.BAD_REQUEST,
                        ErrorCode.VALIDATION_ERROR,
                        message,
                        request
                ));
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleAccessDeniedException(
            AccessDeniedException ex,
            HttpServletRequest request
    ) {

        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(buildError(
                        HttpStatus.FORBIDDEN,
                        ErrorCode.FORBIDDEN,
                        ex.getMessage(),
                        request
                ));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGenericException(
            Exception ex,
            HttpServletRequest request
    ) {

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(buildError(
                        HttpStatus.INTERNAL_SERVER_ERROR,
                        ErrorCode.INTERNAL_SERVER_ERROR,
                        "An unexpected error occurred",
                        request
                ));
    }


    private ErrorResponse buildError(
            HttpStatus status,
            ErrorCode code,
            String message,
            HttpServletRequest request
    ) {
        return new ErrorResponse(
                LocalDateTime.now(),
                status.value(),
                status.getReasonPhrase(),
                code,
                message,
                request.getRequestURI()
        );
    }
}