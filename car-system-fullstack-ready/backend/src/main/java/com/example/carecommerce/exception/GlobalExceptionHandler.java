package com.example.carecommerce.exception;

import com.example.carecommerce.dto.ApiError;
import org.springframework.http.*;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {
    private ApiError error(String m){return new ApiError(m,LocalDateTime.now());}
    @ExceptionHandler(IllegalArgumentException.class) ResponseEntity<ApiError> bad(IllegalArgumentException e){return ResponseEntity.badRequest().body(error(e.getMessage()));}
    @ExceptionHandler(BadCredentialsException.class) ResponseEntity<ApiError> creds(){return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error("Invalid email or password."));}
    @ExceptionHandler(MethodArgumentNotValidException.class) ResponseEntity<ApiError> validation(MethodArgumentNotValidException e){
        String m=e.getBindingResult().getFieldErrors().stream().map(x->x.getField()+": "+x.getDefaultMessage()).collect(Collectors.joining(", "));
        return ResponseEntity.badRequest().body(error(m));
    }
}
