package com.example.delivery.exception;

/** Règle métier violée (HTTP 422). */
public class BusinessException extends RuntimeException {
    public BusinessException(String message) {
        super(message);
    }
}
