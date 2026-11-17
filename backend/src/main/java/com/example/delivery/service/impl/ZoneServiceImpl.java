package com.example.delivery.service.impl;

import com.example.delivery.dto.request.ZoneRequest;
import com.example.delivery.dto.response.ZoneResponse;
import com.example.delivery.entity.Zone;
import com.example.delivery.exception.ConflictException;
import com.example.delivery.exception.ResourceNotFoundException;
import com.example.delivery.mapper.ZoneMapper;
import com.example.delivery.repository.DelivererRepository;
import com.example.delivery.repository.OrderRepository;
import com.example.delivery.repository.ZoneRepository;
import com.example.delivery.service.ZoneService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ZoneServiceImpl implements ZoneService {

    private final ZoneRepository zoneRepository;
    private final OrderRepository orderRepository;
    private final DelivererRepository delivererRepository;
    private final ZoneMapper mapper;

    @Override
    public List<ZoneResponse> findAll() {
        return zoneRepository.findAllByOrderByNameAsc().stream().map(mapper::toResponse).toList();
    }

    @Override
    @Transactional
    public ZoneResponse create(ZoneRequest request) {
        String code = request.code().trim().toUpperCase();
        if (zoneRepository.existsByCodeIgnoreCase(code)) {
            throw new ConflictException("Le code de zone '%s' existe déjà".formatted(code));
        }
        Zone zone = new Zone();
        apply(zone, request, code);
        return mapper.toResponse(zoneRepository.save(zone));
    }

    @Override
    @Transactional
    public ZoneResponse update(Long id, ZoneRequest request) {
        Zone zone = find(id);
        String code = request.code().trim().toUpperCase();
        if (zoneRepository.existsByCodeIgnoreCaseAndIdNot(code, id)) {
            throw new ConflictException("Le code de zone '%s' existe déjà".formatted(code));
        }
        apply(zone, request, code);
        return mapper.toResponse(zone);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        Zone zone = find(id);
        if (orderRepository.existsByZoneId(id) || delivererRepository.existsByZoneId(id)) {
            throw new ConflictException("Cette zone est utilisée par des commandes ou des livreurs");
        }
        zoneRepository.delete(zone);
    }

    private Zone find(Long id) {
        return zoneRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Zone", id));
    }

    private void apply(Zone zone, ZoneRequest r, String code) {
        zone.setCode(code);
        zone.setName(r.name().trim());
        zone.setSurchargeRate(r.surchargeRate());
    }
}
