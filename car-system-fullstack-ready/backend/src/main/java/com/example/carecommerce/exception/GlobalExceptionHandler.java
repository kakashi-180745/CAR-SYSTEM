package com.example.carecommerce.exception;

import com.example.carecommerce.dto.ApiError;
import org.springframework.http.*;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.NoSuchElementException;
import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {
    private ApiError error(String m) {
        return new ApiError(m, LocalDateTime.now());
    }

    @ExceptionHandler(IllegalArgumentException.class)
    ResponseEntity<ApiError> bad(IllegalArgumentException e) {
        return ResponseEntity.badRequest().body(error(e.getMessage()));
    }

    @ExceptionHandler(NoSuchElementException.class)
    ResponseEntity<ApiError> notFound(NoSuchElementException e) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error(e.getMessage() != null ? e.getMessage() : "Resource not found."));
    }

    @ExceptionHandler(BadCredentialsException.class)
    ResponseEntity<ApiError> creds() {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error("Invalid email or password."));
    }

    @ExceptionHandler(AccessDeniedException.class)
    ResponseEntity<ApiError> forbidden() {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error("You do not have permission to perform this action."));
    }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    ResponseEntity<ApiError> uploadTooLarge() {
        return ResponseEntity.status(HttpStatus.PAYLOAD_TOO_LARGE).body(error("Uploaded image must be 5MB or smaller."));
    }

    @ExceptionHandler(ResponseStatusException.class)
    ResponseEntity<ApiError> responseStatus(ResponseStatusException e) {
        return ResponseEntity.status(e.getStatusCode()).body(error(e.getReason() != null ? e.getReason() : "Request failed."));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    ResponseEntity<ApiError> validation(MethodArgumentNotValidException e) {
        String m = e.getBindingResult().getFieldErrors().stream()
            .map(x -> x.getField() + ": " + x.getDefaultMessage())
            .collect(Collectors.joining(", "));
        return ResponseEntity.badRequest().body(error(m));
    }
}
