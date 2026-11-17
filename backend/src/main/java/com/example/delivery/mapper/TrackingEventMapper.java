package com.example.delivery.mapper;

import com.example.delivery.dto.response.TrackingEventResponse;
import com.example.delivery.entity.TrackingEvent;
import org.springframework.stereotype.Component;

@Component
public class TrackingEventMapper {

    public TrackingEventResponse toResponse(TrackingEvent e) {
        return new TrackingEventResponse(e.getId(), e.getStatus(), e.getNote(), e.getActor(), e.getCreatedAt());
    }
}
