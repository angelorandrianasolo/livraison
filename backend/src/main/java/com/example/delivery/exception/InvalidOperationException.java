package com.example.delivery.exception;

/** Opération incompatible avec l'état courant de la ressource (HTTP 409). */
public class InvalidOperationException extends BusinessException {
    public InvalidOperationException(String message) {
        super(message);
    }
}
