package com.example.delivery.exception;

/** Conflit avec une ressource existante ou liée (HTTP 409). */
public class ConflictException extends BusinessException {
    public ConflictException(String message) {
        super(message);
    }
}
