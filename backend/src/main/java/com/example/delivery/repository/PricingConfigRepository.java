package com.example.delivery.repository;

import com.example.delivery.entity.PricingConfig;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PricingConfigRepository extends JpaRepository<PricingConfig, Long> {

    Optional<PricingConfig> findFirstByOrderByIdAsc();
}
