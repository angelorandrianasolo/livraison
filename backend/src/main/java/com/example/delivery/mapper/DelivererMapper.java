package com.example.delivery.mapper;

import com.example.delivery.dto.response.DelivererResponse;
import com.example.delivery.entity.Deliverer;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DelivererMapper {

    private final ZoneMapper zoneMapper;

    public DelivererResponse toResponse(Deliverer d) {
        return new DelivererResponse(d.getId(), d.getFirstName(), d.getLastName(), d.getFullName(), d.getPhone(),
                d.getVehicleType(), zoneMapper.toResponse(d.getZone()), d.getStatus(), d.getMaxCapacityKg(),
                d.getMaxVolumeM3(), d.getMaxActiveDeliveries(), d.getLastLatitude(), d.getLastLongitude());
    }
}
