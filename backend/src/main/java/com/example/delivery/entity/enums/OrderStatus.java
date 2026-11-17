package com.example.delivery.entity.enums;

import java.util.EnumSet;
import java.util.Set;

/**
 * Cycle de vie d'une commande. Les transitions autorisées sont définies ici,
 * à un seul endroit, pour empêcher tout changement d'état incohérent.
 */
public enum OrderStatus {
    CREEE,
    ASSIGNEE,
    PRISE_EN_CHARGE,
    EN_TRANSIT,
    LIVREE,
    ANNULEE,
    ECHEC_LIVRAISON,
    RETOURNEE;

    public Set<OrderStatus> allowedTransitions() {
        return switch (this) {
            case CREEE -> EnumSet.of(ASSIGNEE, ANNULEE);
            case ASSIGNEE -> EnumSet.of(PRISE_EN_CHARGE, ANNULEE);
            case PRISE_EN_CHARGE -> EnumSet.of(EN_TRANSIT, ECHEC_LIVRAISON, ANNULEE);
            case EN_TRANSIT -> EnumSet.of(LIVREE, ECHEC_LIVRAISON);
            case ECHEC_LIVRAISON -> EnumSet.of(ASSIGNEE, RETOURNEE, ANNULEE);
            case LIVREE, ANNULEE, RETOURNEE -> EnumSet.noneOf(OrderStatus.class);
        };
    }

    public boolean canTransitionTo(OrderStatus target) {
        return allowedTransitions().contains(target);
    }

    public boolean isTerminal() {
        return allowedTransitions().isEmpty();
    }

    /** Commande actuellement confiée à un livreur (comptée dans sa charge). */
    public boolean isActiveAssignment() {
        return this == ASSIGNEE || this == PRISE_EN_CHARGE || this == EN_TRANSIT;
    }
}
