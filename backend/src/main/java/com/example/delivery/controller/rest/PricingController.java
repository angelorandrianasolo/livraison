package com.example.delivery.controller.rest;

import com.example.delivery.dto.request.PriceEstimateRequest;
import com.example.delivery.dto.request.PricingConfigRequest;
import com.example.delivery.dto.response.PriceBreakdownResponse;
import com.example.delivery.dto.response.PricingConfigResponse;
import com.example.delivery.service.PricingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/pricing")
@RequiredArgsConstructor
public class PricingController {

    private final PricingService pricingService;

    @GetMapping("/config")
    public PricingConfigResponse config() {
        return pricingService.getConfig();
    }

    @PutMapping("/config")
    public PricingConfigResponse updateConfig(@Valid @RequestBody PricingConfigRequest request) {
        return pricingService.updateConfig(request);
    }

    @PostMapping("/estimate")
    public PriceBreakdownResponse estimate(@Valid @RequestBody PriceEstimateRequest request) {
        return pricingService.estimate(request);
    }
}
