package com.example.delivery.mapper;

import com.example.delivery.dto.response.OrderResponse;
import com.example.delivery.dto.response.OrderResponse.CustomerSummary;
import com.example.delivery.dto.response.OrderResponse.DelivererSummary;
import com.example.delivery.dto.response.OrderResponse.ProofResponse;
import com.example.delivery.entity.DeliveryOrder;
import com.example.delivery.entity.ProofOfDelivery;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class OrderMapper {

    private final ZoneMapper zoneMapper;

    public OrderResponse toResponse(DeliveryOrder o) {
        var deliverer = o.getDeliverer() == null ? null
                : new DelivererSummary(o.getDeliverer().getId(), o.getDeliverer().getFullName(), o.getDeliverer().getPhone());
        ProofOfDelivery p = o.getProof();
        var proof = p == null || p.getDeliveredAt() == null ? null
                : new ProofResponse(p.getDeliveredAt(), p.getReceiverName(), p.getConfirmationCode(), p.getComment());
        return new OrderResponse(o.getId(), o.getOrderNumber(), o.getStatus(), o.getStatus().allowedTransitions(),
                o.getPriority(), new CustomerSummary(o.getCustomer().getId(), o.getCustomer().getName()),
                o.getPickupAddress(), o.getDeliveryAddress(), o.getPickupLatitude(), o.getPickupLongitude(),
                o.getWeightKg(), o.getVolumeM3(), o.getDistanceKm(), zoneMapper.toResponse(o.getZone()),
                o.getPrice(), o.getPlannedDate(), deliverer, proof, o.getCreatedAt(), o.getUpdatedAt());
    }
}
