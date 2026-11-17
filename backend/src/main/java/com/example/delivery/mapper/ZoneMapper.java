package com.example.delivery.mapper;

import com.example.delivery.dto.response.ZoneResponse;
import com.example.delivery.entity.Zone;
import org.springframework.stereotype.Component;

@Component
public class ZoneMapper {

    public ZoneResponse toResponse(Zone zone) {
        return new ZoneResponse(zone.getId(), zone.getCode(), zone.getName(), zone.getSurchargeRate());
    }
}
