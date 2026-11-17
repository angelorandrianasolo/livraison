package com.example.delivery.exception;

import java.time.Instant;
import java.util.Map;

/** Format unique des erreurs renvoyées par l'API REST. */
public record ApiError(
        Instant timestamp,
        int status,
        String error,
        String message,
        String path,
        Map<String, String> fieldErrors) {
}
