package com.example.delivery.service;

import com.example.delivery.dto.request.DelivererRequest;
import com.example.delivery.dto.response.DelivererCandidateResponse;
import com.example.delivery.dto.response.DelivererResponse;
import com.example.delivery.dto.response.PageResponse;
import com.example.delivery.entity.enums.DelivererStatus;
import java.util.List;
import org.springframework.data.domain.Pageable;

public interface DelivererService {
    PageResponse<DelivererResponse> search(DelivererStatus status, Long zoneId, String q, Pageable pageable);

    DelivererResponse get(Long id);

    DelivererResponse create(DelivererRequest request);

    DelivererResponse update(Long id, DelivererRequest request);

    DelivererResponse updateStatus(Long id, DelivererStatus status);

    void delete(Long id);

    /** Livreurs disponibles ; classés par score si une commande est fournie. */
    List<DelivererCandidateResponse> available(Long orderId);
}
