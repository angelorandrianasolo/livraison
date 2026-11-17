package com.example.delivery.service.impl;

import com.example.delivery.dto.request.PriceEstimateRequest;
import com.example.delivery.dto.request.PricingConfigRequest;
import com.example.delivery.dto.response.PriceBreakdownResponse;
import com.example.delivery.dto.response.PricingConfigResponse;
import com.example.delivery.entity.PricingConfig;
import com.example.delivery.entity.Zone;
import com.example.delivery.exception.ResourceNotFoundException;
import com.example.delivery.mapper.PricingMapper;
import com.example.delivery.repository.PricingConfigRepository;
import com.example.delivery.repository.ZoneRepository;
import com.example.delivery.service.PricingService;
import java.math.BigDecimal;
import java.math.RoundingMode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * prix = (base + km × tarif/km + kg × tarif/kg + m³ × tarif/m³) × multiplicateur de priorité × (1 + majoration de zone)
 */
@Service
@RequiredArgsConstructor
@Transactional
public class PricingServiceImpl implements PricingService {

    private final PricingConfigRepository configRepository;
    private final ZoneRepository zoneRepository;
    private final PricingMapper mapper;

    @Override
    public PriceBreakdownResponse estimate(PriceEstimateRequest r) {
        Zone zone = zoneRepository.findById(r.zoneId())
                .orElseThrow(() -> new ResourceNotFoundException("Zone", r.zoneId()));
        PricingConfig cfg = loadOrCreate();

        BigDecimal distanceCost = money(cfg.getPricePerKm().multiply(BigDecimal.valueOf(r.distanceKm())));
        BigDecimal weightCost = money(cfg.getPricePerKg().multiply(BigDecimal.valueOf(r.weightKg())));
        BigDecimal volumeCost = money(cfg.getPricePerM3().multiply(BigDecimal.valueOf(r.volumeM3())));
        BigDecimal subtotal = cfg.getBaseFee().add(distanceCost).add(weightCost).add(volumeCost);

        BigDecimal multiplier = switch (r.priority()) {
            case NORMALE -> BigDecimal.ONE;
            case URGENTE -> cfg.getUrgentMultiplier();
            case EXPRESS -> cfg.getExpressMultiplier();
        };
        BigDecimal total = money(subtotal.multiply(multiplier).multiply(BigDecimal.ONE.add(zone.getSurchargeRate())));

        return new PriceBreakdownResponse(cfg.getBaseFee(), distanceCost, weightCost, volumeCost, money(subtotal),
                multiplier, zone.getSurchargeRate(), total);
    }

    @Override
    public PricingConfigResponse getConfig() {
        return mapper.toResponse(loadOrCreate());
    }

    @Override
    public PricingConfigResponse updateConfig(PricingConfigRequest r) {
        PricingConfig cfg = loadOrCreate();
        cfg.setBaseFee(r.baseFee());
        cfg.setPricePerKm(r.pricePerKm());
        cfg.setPricePerKg(r.pricePerKg());
        cfg.setPricePerM3(r.pricePerM3());
        cfg.setUrgentMultiplier(r.urgentMultiplier());
        cfg.setExpressMultiplier(r.expressMultiplier());
        return mapper.toResponse(cfg);
    }

    private PricingConfig loadOrCreate() {
        return configRepository.findFirstByOrderByIdAsc().orElseGet(() -> {
            PricingConfig cfg = new PricingConfig();
            cfg.setBaseFee(new BigDecimal("3.00"));
            cfg.setPricePerKm(new BigDecimal("0.80"));
            cfg.setPricePerKg(new BigDecimal("0.10"));
            cfg.setPricePerM3(new BigDecimal("5.00"));
            cfg.setUrgentMultiplier(new BigDecimal("1.30"));
            cfg.setExpressMultiplier(new BigDecimal("1.80"));
            return configRepository.save(cfg);
        });
    }

    private static BigDecimal money(BigDecimal value) {
        return value.setScale(2, RoundingMode.HALF_UP);
    }
}
