package com.example.delivery.dto.response;

import com.example.delivery.entity.enums.DelivererStatus;
import com.example.delivery.entity.enums.VehicleType;

public record DelivererResponse(
        Long id,
        String firstName,
        String lastName,
        String fullName,
        String phone,
        VehicleType vehicleType,
        ZoneResponse zone,
        DelivererStatus status,
        double maxCapacityKg,
        double maxVolumeM3,
        int maxActiveDeliveries,
        Double lastLatitude,
        Double lastLongitude) {
}
