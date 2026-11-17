package com.example.delivery.exception;

/** Ressource inexistante (HTTP 404). */
public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String resource, Object id) {
        super("%s introuvable (id=%s)".formatted(resource, id));
    }
}
