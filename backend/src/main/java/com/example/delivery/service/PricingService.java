package com.example.delivery.service;

import com.example.delivery.dto.request.PriceEstimateRequest;
import com.example.delivery.dto.request.PricingConfigRequest;
import com.example.delivery.dto.response.PriceBreakdownResponse;
import com.example.delivery.dto.response.PricingConfigResponse;

public interface PricingService {
    PriceBreakdownResponse estimate(PriceEstimateRequest request);

    PricingConfigResponse getConfig();

    PricingConfigResponse updateConfig(PricingConfigRequest request);
}
