package com.example.delivery.service.impl;

import com.example.delivery.dto.request.CreateIncidentRequest;
import com.example.delivery.dto.request.ResolveIncidentRequest;
import com.example.delivery.dto.response.IncidentResponse;
import com.example.delivery.dto.response.PageResponse;
import com.example.delivery.entity.Deliverer;
import com.example.delivery.entity.DeliveryOrder;
import com.example.delivery.entity.Incident;
import com.example.delivery.entity.enums.DelivererStatus;
import com.example.delivery.entity.enums.IncidentType;
import com.example.delivery.entity.enums.OrderStatus;
import com.example.delivery.exception.InvalidOperationException;
import com.example.delivery.exception.ResourceNotFoundException;
import com.example.delivery.mapper.IncidentMapper;
import com.example.delivery.repository.IncidentRepository;
import com.example.delivery.repository.OrderRepository;
import com.example.delivery.service.IncidentService;
import java.time.Clock;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class IncidentServiceImpl implements IncidentService {

    private final IncidentRepository incidentRepository;
    private final OrderRepository orderRepository;
    private final DelivererWorkload workload;
    private final TrackingRecorder tracker;
    private final IncidentMapper mapper;
    private final Clock clock;

    /**
     * Un incident signalé en cours de livraison fait passer la commande en ECHEC_LIVRAISON
     * (sauf colis endommagé, simplement consigné). Une panne rend en plus le livreur INDISPONIBLE.
     */
    @Override
    @Transactional
    public IncidentResponse report(Long orderId, CreateIncidentRequest request) {
        DeliveryOrder order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Commande", orderId));
        Deliverer deliverer = order.getDeliverer();
        boolean inProgress = order.getStatus() == OrderStatus.PRISE_EN_CHARGE || order.getStatus() == OrderStatus.EN_TRANSIT;
        if (deliverer == null || !inProgress) {
            throw new InvalidOperationException("Un incident ne peut être signalé que sur une commande en cours de livraison");
        }

        Incident incident = new Incident();
        incident.setType(request.type());
        incident.setDescription(request.description().trim());
        incident.setOrder(order);
        incident.setDeliverer(deliverer);

        if (request.type() != IncidentType.COLIS_ENDOMMAGE) {
            order.transitionTo(OrderStatus.ECHEC_LIVRAISON);
            workload.releaseIfIdle(deliverer, order.getId());
            tracker.record(order, OrderStatus.ECHEC_LIVRAISON, "Incident : " + request.type());
        }
        if (request.type() == IncidentType.VEHICULE_EN_PANNE) {
            deliverer.setStatus(DelivererStatus.INDISPONIBLE);
        }
        return mapper.toResponse(incidentRepository.save(incident));
    }

    @Override
    @Transactional
    public IncidentResponse resolve(Long incidentId, ResolveIncidentRequest request) {
        Incident incident = incidentRepository.findById(incidentId)
                .orElseThrow(() -> new ResourceNotFoundException("Incident", incidentId));
        if (incident.isResolved()) {
            throw new InvalidOperationException("Cet incident est déjà résolu");
        }
        incident.setResolution(request.resolution().trim());
        incident.setResolved(true);
        incident.setResolvedAt(clock.instant());
        return mapper.toResponse(incident);
    }

    @Override
    public PageResponse<IncidentResponse> search(Boolean resolved, Pageable pageable) {
        Page<Incident> page = resolved == null
                ? incidentRepository.findAll(pageable)
                : incidentRepository.findByResolved(resolved, pageable);
        return PageResponse.from(page.map(mapper::toResponse));
    }

    @Override
    public List<IncidentResponse> findByOrder(Long orderId) {
        return incidentRepository.findByOrderIdOrderByCreatedAtDesc(orderId).stream().map(mapper::toResponse).toList();
    }
}
