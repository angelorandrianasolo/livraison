package com.example.delivery.service;

import com.example.delivery.dto.request.CreateOrderRequest;
import com.example.delivery.dto.request.DeliverOrderRequest;
import com.example.delivery.dto.request.OrderFilter;
import com.example.delivery.dto.request.UpdateOrderRequest;
import com.example.delivery.dto.response.OrderResponse;
import com.example.delivery.dto.response.PageResponse;
import com.example.delivery.dto.response.TrackingEventResponse;
import java.util.List;
import org.springframework.data.domain.Pageable;

public interface OrderService {
    PageResponse<OrderResponse> search(OrderFilter filter, Pageable pageable);

    OrderResponse get(Long id);

    OrderResponse create(CreateOrderRequest request);

    OrderResponse update(Long id, UpdateOrderRequest request);

    /** delivererId nul : attribution automatique. */
    OrderResponse assign(Long id, Long delivererId);

    OrderResponse pickup(Long id);

    OrderResponse start(Long id);

    OrderResponse deliver(Long id, DeliverOrderRequest request);

    OrderResponse cancel(Long id, String reason);

    OrderResponse markReturned(Long id);

    List<TrackingEventResponse> tracking(Long id);
}
