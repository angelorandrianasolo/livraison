package com.example.delivery.service.impl;

import com.example.delivery.entity.Deliverer;
import com.example.delivery.entity.enums.DelivererStatus;
import com.example.delivery.entity.enums.OrderStatus;
import com.example.delivery.repository.OrderRepository;
import java.util.EnumSet;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

/** Règles de charge et de statut d'un livreur, partagées par plusieurs services. */
@Component
@RequiredArgsConstructor
public class DelivererWorkload {

    private static final Set<OrderStatus> ACTIVE =
            EnumSet.of(OrderStatus.ASSIGNEE, OrderStatus.PRISE_EN_CHARGE, OrderStatus.EN_TRANSIT);

    private final OrderRepository orderRepository;

    public int activeCount(Deliverer deliverer) {
        return (int) orderRepository.countByDelivererIdAndStatusIn(deliverer.getId(), ACTIVE);
    }

    public void markBusy(Deliverer deliverer) {
        deliverer.setStatus(DelivererStatus.EN_LIVRAISON);
    }

    /** Repasse le livreur DISPONIBLE s'il n'a plus aucun colis en transit (hors commande donnée). */
    public void releaseIfIdle(Deliverer deliverer, Long excludedOrderId) {
        if (deliverer.getStatus() == DelivererStatus.EN_LIVRAISON
                && orderRepository.countByDelivererIdAndStatusAndIdNot(
                deliverer.getId(), OrderStatus.EN_TRANSIT, excludedOrderId) == 0) {
            deliverer.setStatus(DelivererStatus.DISPONIBLE);
        }
    }
}
