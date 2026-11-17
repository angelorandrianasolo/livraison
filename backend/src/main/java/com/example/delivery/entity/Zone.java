package com.example.delivery.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "zones")
public class Zone extends BaseEntity {

    @Column(nullable = false, unique = true, length = 20)
    private String code;

    @Column(nullable = false, length = 80)
    private String name;

    /** Majoration appliquée au prix, ex. 0.10 = +10 %. */
    @Column(nullable = false, precision = 5, scale = 2)
    private BigDecimal surchargeRate = BigDecimal.ZERO;
}
