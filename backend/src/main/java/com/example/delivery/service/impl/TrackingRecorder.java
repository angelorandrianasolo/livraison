package com.example.delivery.service.impl;

import com.example.delivery.entity.DeliveryOrder;
import com.example.delivery.entity.TrackingEvent;
import com.example.delivery.entity.enums.OrderStatus;
import com.example.delivery.repository.TrackingEventRepository;
import com.example.delivery.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

/** Historise chaque changement d'état d'une commande (suivi de livraison). */
@Component
@RequiredArgsConstructor
public class TrackingRecorder {

    private final TrackingEventRepository repository;

    public void record(DeliveryOrder order, OrderStatus status, String note) {
        TrackingEvent event = new TrackingEvent();
        event.setOrder(order);
        event.setStatus(status);
        event.setNote(note);
        event.setActor(SecurityUtils.currentUsername());
        repository.save(event);
    }
}
