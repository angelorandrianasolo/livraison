package com.example.delivery.service.impl;

import com.example.delivery.dto.request.DelivererRequest;
import com.example.delivery.dto.response.DelivererCandidateResponse;
import com.example.delivery.dto.response.DelivererResponse;
import com.example.delivery.dto.response.PageResponse;
import com.example.delivery.entity.Deliverer;
import com.example.delivery.entity.DeliveryOrder;
import com.example.delivery.entity.Zone;
import com.example.delivery.entity.enums.DelivererStatus;
import com.example.delivery.exception.ConflictException;
import com.example.delivery.exception.InvalidOperationException;
import com.example.delivery.exception.ResourceNotFoundException;
import com.example.delivery.mapper.DelivererMapper;
import com.example.delivery.repository.DelivererRepository;
import com.example.delivery.repository.DelivererSpecifications;
import com.example.delivery.repository.OrderRepository;
import com.example.delivery.repository.ZoneRepository;
import com.example.delivery.service.AssignmentService;
import com.example.delivery.service.DelivererService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DelivererServiceImpl implements DelivererService {

    private final DelivererRepository delivererRepository;
    private final ZoneRepository zoneRepository;
    private final OrderRepository orderRepository;
    private final AssignmentService assignmentService;
    private final DelivererWorkload workload;
    private final DelivererMapper mapper;

    @Override
    public PageResponse<DelivererResponse> search(DelivererStatus status, Long zoneId, String q, Pageable pageable) {
        return PageResponse.from(delivererRepository
                .findAll(DelivererSpecifications.withFilter(status, zoneId, q), pageable)
                .map(mapper::toResponse));
    }

    @Override
    public DelivererResponse get(Long id) {
        return mapper.toResponse(find(id));
    }

    @Override
    @Transactional
    public DelivererResponse create(DelivererRequest request) {
        Deliverer deliverer = new Deliverer();
        apply(deliverer, request);
        return mapper.toResponse(delivererRepository.save(deliverer));
    }

    @Override
    @Transactional
    public DelivererResponse update(Long id, DelivererRequest request) {
        Deliverer deliverer = find(id);
        apply(deliverer, request);
        return mapper.toResponse(deliverer);
    }

    @Override
    @Transactional
    public DelivererResponse updateStatus(Long id, DelivererStatus status) {
        Deliverer deliverer = find(id);
        if (status == DelivererStatus.EN_LIVRAISON) {
            throw new InvalidOperationException("Le statut EN_LIVRAISON est géré automatiquement par le système");
        }
        if (deliverer.getStatus() == DelivererStatus.EN_LIVRAISON) {
            throw new InvalidOperationException("Ce livreur a des colis en transit : terminez ses livraisons d'abord");
        }
        deliverer.setStatus(status);
        return mapper.toResponse(deliverer);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        Deliverer deliverer = find(id);
        if (orderRepository.existsByDelivererId(id)) {
            throw new ConflictException("Ce livreur est lié à des commandes : passez-le en INDISPONIBLE plutôt que de le supprimer");
        }
        delivererRepository.delete(deliverer);
    }

    @Override
    public List<DelivererCandidateResponse> available(Long orderId) {
        if (orderId == null) {
            return delivererRepository.findByStatus(DelivererStatus.DISPONIBLE).stream()
                    .map(d -> new DelivererCandidateResponse(mapper.toResponse(d), null, null, workload.activeCount(d)))
                    .toList();
        }
        DeliveryOrder order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Commande", orderId));
        return assignmentService.rankCandidates(order).stream()
                .map(c -> new DelivererCandidateResponse(mapper.toResponse(c.deliverer()), c.score(),
                        c.distanceKm(), c.activeDeliveries()))
                .toList();
    }

    private Deliverer find(Long id) {
        return delivererRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Livreur", id));
    }

    private void apply(Deliverer d, DelivererRequest r) {
        Zone zone = zoneRepository.findById(r.zoneId())
                .orElseThrow(() -> new ResourceNotFoundException("Zone", r.zoneId()));
        d.setFirstName(r.firstName().trim());
        d.setLastName(r.lastName().trim());
        d.setPhone(r.phone().trim());
        d.setVehicleType(r.vehicleType());
        d.setZone(zone);
        d.setMaxCapacityKg(r.maxCapacityKg());
        d.setMaxVolumeM3(r.maxVolumeM3());
        d.setMaxActiveDeliveries(r.maxActiveDeliveries());
        d.setLastLatitude(r.lastLatitude());
        d.setLastLongitude(r.lastLongitude());
    }
}
