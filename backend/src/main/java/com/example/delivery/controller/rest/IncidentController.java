package com.example.delivery.controller.rest;

import com.example.delivery.dto.request.CreateIncidentRequest;
import com.example.delivery.dto.request.ResolveIncidentRequest;
import com.example.delivery.dto.response.IncidentResponse;
import com.example.delivery.dto.response.PageResponse;
import com.example.delivery.service.IncidentService;
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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class IncidentController {

    private final IncidentService incidentService;

    @PostMapping("/orders/{orderId}/incidents")
    public ResponseEntity<IncidentResponse> report(@PathVariable Long orderId,
                                                   @Valid @RequestBody CreateIncidentRequest request) {
        IncidentResponse created = incidentService.report(orderId, request);
        return ResponseEntity.created(URI.create("/api/incidents/" + created.id())).body(created);
    }

    @GetMapping("/orders/{orderId}/incidents")
    public List<IncidentResponse> byOrder(@PathVariable Long orderId) {
        return incidentService.findByOrder(orderId);
    }

    @GetMapping("/incidents")
    public PageResponse<IncidentResponse> search(
            @RequestParam(required = false) Boolean resolved,
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return incidentService.search(resolved, pageable);
    }

    @PutMapping("/incidents/{id}/resolve")
    public IncidentResponse resolve(@PathVariable Long id, @Valid @RequestBody ResolveIncidentRequest request) {
        return incidentService.resolve(id, request);
    }
}
