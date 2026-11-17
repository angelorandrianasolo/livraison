package com.example.delivery.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** Grille tarifaire (une seule ligne), modifiable par l'administrateur. */
@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "pricing_config")
public class PricingConfig extends BaseEntity {

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal baseFee;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal pricePerKm;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal pricePerKg;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal pricePerM3;

    @Column(nullable = false, precision = 5, scale = 2)
    private BigDecimal urgentMultiplier;

    @Column(nullable = false, precision = 5, scale = 2)
    private BigDecimal expressMultiplier;
}
