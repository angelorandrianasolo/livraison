package com.example.delivery.mapper;

import com.example.delivery.dto.response.PricingConfigResponse;
import com.example.delivery.entity.PricingConfig;
import org.springframework.stereotype.Component;

@Component
public class PricingMapper {

    public PricingConfigResponse toResponse(PricingConfig c) {
        return new PricingConfigResponse(c.getBaseFee(), c.getPricePerKm(), c.getPricePerKg(), c.getPricePerM3(),
                c.getUrgentMultiplier(), c.getExpressMultiplier());
    }
}
