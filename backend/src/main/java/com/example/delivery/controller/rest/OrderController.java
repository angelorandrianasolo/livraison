package com.example.delivery.controller.rest;

import com.example.delivery.dto.request.AssignOrderRequest;
import com.example.delivery.dto.request.CancelOrderRequest;
import com.example.delivery.dto.request.CreateOrderRequest;
import com.example.delivery.dto.request.DeliverOrderRequest;
import com.example.delivery.dto.request.OrderFilter;
import com.example.delivery.dto.request.UpdateOrderRequest;
import com.example.delivery.dto.response.OrderResponse;
import com.example.delivery.dto.response.PageResponse;
import com.example.delivery.dto.response.TrackingEventResponse;
import com.example.delivery.service.OrderService;
import jakarta.validation.Valid;
import java.net.URI;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    /** Ex. : GET /api/orders?page=0&size=10&sort=createdAt,desc&status=CREEE&q=cobalt */
    @GetMapping
    public PageResponse<OrderResponse> search(
            OrderFilter filter,
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return orderService.search(filter, pageable);
    }

    @GetMapping("/{id}")
    public OrderResponse get(@PathVariable Long id) {
        return orderService.get(id);
    }

    @PostMapping
    public ResponseEntity<OrderResponse> create(@Valid @RequestBody CreateOrderRequest request) {
        OrderResponse created = orderService.create(request);
        return ResponseEntity.created(URI.create("/api/orders/" + created.id())).body(created);
    }

    @PutMapping("/{id}")
    public OrderResponse update(@PathVariable Long id, @Valid @RequestBody UpdateOrderRequest request) {
        return orderService.update(id, request);
    }

    /** Corps optionnel : sans delivererId, le meilleur livreur éligible est choisi automatiquement. */
    @PostMapping("/{id}/assign")
    public OrderResponse assign(@PathVariable Long id, @RequestBody(required = false) AssignOrderRequest request) {
        return orderService.assign(id, request == null ? null : request.delivererId());
    }

    @PostMapping("/{id}/pickup")
    public OrderResponse pickup(@PathVariable Long id) {
        return orderService.pickup(id);
    }

    @PostMapping("/{id}/start")
    public OrderResponse start(@PathVariable Long id) {
        return orderService.start(id);
    }

    @PostMapping("/{id}/deliver")
    public OrderResponse deliver(@PathVariable Long id, @Valid @RequestBody DeliverOrderRequest request) {
        return orderService.deliver(id, request);
    }

    @PostMapping("/{id}/cancel")
    public OrderResponse cancel(@PathVariable Long id, @Valid @RequestBody(required = false) CancelOrderRequest request) {
        return orderService.cancel(id, request == null ? null : request.reason());
    }

    @PostMapping("/{id}/return")
    public OrderResponse markReturned(@PathVariable Long id) {
        return orderService.markReturned(id);
    }

    @GetMapping("/{id}/tracking")
    public List<TrackingEventResponse> tracking(@PathVariable Long id) {
        return orderService.tracking(id);
    }
}
