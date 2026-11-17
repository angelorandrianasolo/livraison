package com.example.delivery.mapper;

import com.example.delivery.dto.response.IncidentResponse;
import com.example.delivery.entity.Incident;
import org.springframework.stereotype.Component;

@Component
public class IncidentMapper {

    public IncidentResponse toResponse(Incident i) {
        return new IncidentResponse(i.getId(), i.getType(), i.getDescription(), i.getCreatedAt(),
                i.getOrder().getId(), i.getOrder().getOrderNumber(),
                i.getDeliverer().getId(), i.getDeliverer().getFullName(),
                i.getResolution(), i.isResolved(), i.getResolvedAt());
    }
}
