package com.example.delivery.entity;

import com.example.delivery.entity.enums.DelivererStatus;
import com.example.delivery.entity.enums.VehicleType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.Version;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "deliverers")
public class Deliverer extends BaseEntity {

    @Column(nullable = false, length = 80)
    private String firstName;

    @Column(nullable = false, length = 80)
    private String lastName;

    @Column(nullable = false, length = 30)
    private String phone;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private VehicleType vehicleType;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "zone_id")
    private Zone zone;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private DelivererStatus status = DelivererStatus.DISPONIBLE;

    @Column(nullable = false)
    private double maxCapacityKg;

    @Column(nullable = false)
    private double maxVolumeM3;

    @Column(nullable = false)
    private int maxActiveDeliveries = 5;

    private Double lastLatitude;

    private Double lastLongitude;

    @Version
    private Long version;

    public String getFullName() {
        return firstName + " " + lastName;
    }
}
