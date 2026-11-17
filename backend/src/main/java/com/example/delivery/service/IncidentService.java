package com.example.delivery.service;

import com.example.delivery.dto.request.CreateIncidentRequest;
import com.example.delivery.dto.request.ResolveIncidentRequest;
import com.example.delivery.dto.response.IncidentResponse;
import com.example.delivery.dto.response.PageResponse;
import java.util.List;
import org.springframework.data.domain.Pageable;

public interface IncidentService {
    IncidentResponse report(Long orderId, CreateIncidentRequest request);

    IncidentResponse resolve(Long incidentId, ResolveIncidentRequest request);

    PageResponse<IncidentResponse> search(Boolean resolved, Pageable pageable);

    List<IncidentResponse> findByOrder(Long orderId);
}
