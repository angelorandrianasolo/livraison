package com.example.delivery.service.impl;

import com.example.delivery.config.AssignmentProperties;
import com.example.delivery.entity.Deliverer;
import com.example.delivery.entity.DeliveryOrder;
import com.example.delivery.entity.enums.DelivererStatus;
import com.example.delivery.entity.enums.Priority;
import com.example.delivery.exception.BusinessException;
import com.example.delivery.repository.DelivererRepository;
import com.example.delivery.service.AssignmentService;
import com.example.delivery.service.DelivererCandidate;
import com.example.delivery.util.GeoUtils;
import com.example.delivery.util.MathUtils;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Éligibilité : disponible, même zone, capacité (poids/volume) suffisante, charge maximale non atteinte.
 * Score (0-100) = moyenne pondérée de la proximité, de la charge restante et de la marge de capacité.
 * Les commandes urgentes renforcent le poids de la proximité.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AssignmentServiceImpl implements AssignmentService {

    private final DelivererRepository delivererRepository;
    private final DelivererWorkload workload;
    private final AssignmentProperties props;

    @Override
    public List<DelivererCandidate> rankCandidates(DeliveryOrder order) {
        return delivererRepository.findByStatus(DelivererStatus.DISPONIBLE).stream()
                .map(d -> evaluate(order, d))
                .flatMap(Optional::stream)
                .sorted(Comparator.comparingDouble(DelivererCandidate::score).reversed())
                .toList();
    }

    @Override
    public Deliverer selectBest(DeliveryOrder order) {
        return rankCandidates(order).stream().findFirst()
                .map(DelivererCandidate::deliverer)
                .orElseThrow(() -> new BusinessException("Aucun livreur éligible pour cette commande"));
    }

    @Override
    public Optional<String> ineligibilityReason(DeliveryOrder order, Deliverer d) {
        if (d.getStatus() != DelivererStatus.DISPONIBLE) {
            return Optional.of("Le livreur n'est pas disponible (%s)".formatted(d.getStatus()));
        }
        if (!d.getZone().getId().equals(order.getZone().getId())) {
            return Optional.of("Le livreur n'opère pas dans la zone de la commande");
        }
        if (order.getWeightKg() > d.getMaxCapacityKg()) {
            return Optional.of("Le poids du colis dépasse la capacité du véhicule");
        }
        if (order.getVolumeM3() > d.getMaxVolumeM3()) {
            return Optional.of("Le volume du colis dépasse la capacité du véhicule");
        }
        if (workload.activeCount(d) >= d.getMaxActiveDeliveries()) {
            return Optional.of("Le livreur a atteint son nombre maximal de livraisons");
        }
        return Optional.empty();
    }

    @Override
    public void assertEligible(DeliveryOrder order, Deliverer deliverer) {
        ineligibilityReason(order, deliverer).ifPresent(reason -> {
            throw new BusinessException(reason);
        });
    }

    private Optional<DelivererCandidate> evaluate(DeliveryOrder order, Deliverer d) {
        if (ineligibilityReason(order, d).isPresent()) {
            return Optional.empty();
        }
        int active = workload.activeCount(d);
        Double distance = distanceToPickup(order, d);

        double proximity = distance == null ? 0.5 : 1 - Math.min(distance / props.maxProximityKm(), 1.0);
        double load = 1.0 - (double) active / d.getMaxActiveDeliveries();
        double capacity = 1.0 - Math.max(order.getWeightKg() / d.getMaxCapacityKg(),
                order.getVolumeM3() / d.getMaxVolumeM3());

        double proximityWeight = props.proximityWeight()
                * (order.getPriority() == Priority.NORMALE ? 1.0 : props.urgentProximityBoost());
        double totalWeight = proximityWeight + props.loadWeight() + props.capacityWeight();
        double score = 100 * (proximityWeight * proximity + props.loadWeight() * load
                + props.capacityWeight() * capacity) / totalWeight;

        return Optional.of(new DelivererCandidate(d, MathUtils.round1(score),
                distance == null ? null : MathUtils.round1(distance), active));
    }

    private Double distanceToPickup(DeliveryOrder order, Deliverer d) {
        if (order.getPickupLatitude() == null || order.getPickupLongitude() == null
                || d.getLastLatitude() == null || d.getLastLongitude() == null) {
            return null;
        }
        return GeoUtils.haversineKm(d.getLastLatitude(), d.getLastLongitude(),
                order.getPickupLatitude(), order.getPickupLongitude());
    }
}
