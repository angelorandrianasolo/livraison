package com.example.delivery.service;

import com.example.delivery.entity.Deliverer;
import com.example.delivery.entity.DeliveryOrder;
import java.util.List;
import java.util.Optional;

public interface AssignmentService {

    /** Livreurs éligibles, du meilleur au moins bon score. */
    List<DelivererCandidate> rankCandidates(DeliveryOrder order);

    /** Meilleur candidat, ou BusinessException s'il n'y en a aucun. */
    Deliverer selectBest(DeliveryOrder order);

    /** Motif d'inéligibilité, vide si le livreur peut recevoir la commande. */
    Optional<String> ineligibilityReason(DeliveryOrder order, Deliverer deliverer);

    void assertEligible(DeliveryOrder order, Deliverer deliverer);
}
