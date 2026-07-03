package com.devguardian.notification.exception;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class NotificationExceptionHandler {

    @ExceptionHandler(NotificationNotFoundException.class)
    public ResponseEntity<?> handle(NotificationNotFoundException ex) {
        return ResponseEntity.status(404).body(ex.getMessage());
    }
}
