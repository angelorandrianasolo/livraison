package com.example.delivery.controller.rest;

import com.example.delivery.dto.request.DelivererRequest;
import com.example.delivery.dto.request.UpdateDelivererStatusRequest;
import com.example.delivery.dto.response.DelivererCandidateResponse;
import com.example.delivery.dto.response.DelivererResponse;
import com.example.delivery.dto.response.PageResponse;
import com.example.delivery.entity.enums.DelivererStatus;
import com.example.delivery.service.DelivererService;
import jakarta.validation.Valid;
import java.net.URI;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/deliverers")
@RequiredArgsConstructor
public class DelivererController {

    private final DelivererService delivererService;

    @GetMapping
    public PageResponse<DelivererResponse> search(
            @RequestParam(required = false) DelivererStatus status,
            @RequestParam(required = false) Long zoneId,
            @RequestParam(required = false) String q,
            @PageableDefault(size = 10, sort = "lastName", direction = Sort.Direction.ASC) Pageable pageable) {
        return delivererService.search(status, zoneId, q, pageable);
    }

    /** Livreurs disponibles ; avec orderId, classés par score pour cette commande. */
    @GetMapping("/available")
    public List<DelivererCandidateResponse> available(@RequestParam(required = false) Long orderId) {
        return delivererService.available(orderId);
    }

    @GetMapping("/{id}")
    public DelivererResponse get(@PathVariable Long id) {
        return delivererService.get(id);
    }

    @PostMapping
    public ResponseEntity<DelivererResponse> create(@Valid @RequestBody DelivererRequest request) {
        DelivererResponse created = delivererService.create(request);
        return ResponseEntity.created(URI.create("/api/deliverers/" + created.id())).body(created);
    }

    @PutMapping("/{id}")
    public DelivererResponse update(@PathVariable Long id, @Valid @RequestBody DelivererRequest request) {
        return delivererService.update(id, request);
    }

    @PatchMapping("/{id}/status")
    public DelivererResponse updateStatus(@PathVariable Long id, @Valid @RequestBody UpdateDelivererStatusRequest request) {
        return delivererService.updateStatus(id, request.status());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        delivererService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
