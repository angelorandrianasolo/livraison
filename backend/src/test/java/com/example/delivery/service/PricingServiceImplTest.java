package com.example.delivery.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.example.delivery.dto.request.PriceEstimateRequest;
import com.example.delivery.entity.PricingConfig;
import com.example.delivery.entity.Zone;
import com.example.delivery.entity.enums.Priority;
import com.example.delivery.mapper.PricingMapper;
import com.example.delivery.repository.PricingConfigRepository;
import com.example.delivery.repository.ZoneRepository;
import com.example.delivery.service.impl.PricingServiceImpl;
import java.math.BigDecimal;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class PricingServiceImplTest {

    private final PricingConfigRepository configRepository = mock(PricingConfigRepository.class);
    private final ZoneRepository zoneRepository = mock(ZoneRepository.class);
    private PricingServiceImpl service;

    @BeforeEach
    void setUp() {
        PricingConfig cfg = new PricingConfig();
        cfg.setBaseFee(new BigDecimal("3.00"));
        cfg.setPricePerKm(new BigDecimal("0.80"));
        cfg.setPricePerKg(new BigDecimal("0.10"));
        cfg.setPricePerM3(new BigDecimal("5.00"));
        cfg.setUrgentMultiplier(new BigDecimal("1.30"));
        cfg.setExpressMultiplier(new BigDecimal("1.80"));
        when(configRepository.findFirstByOrderByIdAsc()).thenReturn(Optional.of(cfg));
        service = new PricingServiceImpl(configRepository, zoneRepository, new PricingMapper());
    }

    private void zoneWithSurcharge(String rate) {
        Zone zone = new Zone();
        zone.setId(1L);
        zone.setSurchargeRate(new BigDecimal(rate));
        when(zoneRepository.findById(1L)).thenReturn(Optional.of(zone));
    }

    @Test
    void normalPriorityInCentralZone() {
        zoneWithSurcharge("0.00");
        // 3 + 10×0.8 + 5×0.1 + 0.5×5 = 14.00
        var result = service.estimate(new PriceEstimateRequest(1L, 10, 5, 0.5, Priority.NORMALE));
        assertThat(result.total()).isEqualByComparingTo("14.00");
    }

    @Test
    void urgentPriorityAndZoneSurchargeAreApplied() {
        zoneWithSurcharge("0.10");
        // 14.00 × 1.30 × 1.10 = 20.02
        var result = service.estimate(new PriceEstimateRequest(1L, 10, 5, 0.5, Priority.URGENTE));
        assertThat(result.total()).isEqualByComparingTo("20.02");
    }
}
