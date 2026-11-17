package com.example.delivery.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.example.delivery.config.AssignmentProperties;
import com.example.delivery.entity.Deliverer;
import com.example.delivery.entity.DeliveryOrder;
import com.example.delivery.entity.Zone;
import com.example.delivery.entity.enums.DelivererStatus;
import com.example.delivery.entity.enums.Priority;
import com.example.delivery.exception.BusinessException;
import com.example.delivery.repository.DelivererRepository;
import com.example.delivery.service.impl.AssignmentServiceImpl;
import com.example.delivery.service.impl.DelivererWorkload;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class AssignmentServiceImplTest {

    private final DelivererRepository repository = mock(DelivererRepository.class);
    private final DelivererWorkload workload = mock(DelivererWorkload.class);
    private AssignmentServiceImpl service;
    private Zone centre;
    private DeliveryOrder order;

    @BeforeEach
    void setUp() {
        service = new AssignmentServiceImpl(repository, workload,
                new AssignmentProperties(0.5, 0.3, 0.2, 1.5, 30));
        when(workload.activeCount(any())).thenReturn(0);

        centre = zone(1L);
        order = new DeliveryOrder();
        order.setZone(centre);
        order.setWeightKg(5);
        order.setVolumeM3(0.1);
        order.setPriority(Priority.NORMALE);
        order.setPickupLatitude(48.85);
        order.setPickupLongitude(2.35);
    }

    @Test
    void closestEligibleDelivererWins() {
        Deliverer near = deliverer(1L, centre, 48.851, 2.351, 50);
        Deliverer far = deliverer(2L, centre, 48.95, 2.45, 50);
        when(repository.findByStatus(DelivererStatus.DISPONIBLE)).thenReturn(List.of(far, near));

        assertThat(service.selectBest(order)).isSameAs(near);
    }

    @Test
    void delivererFromAnotherZoneOrTooSmallIsExcluded() {
        Deliverer otherZone = deliverer(1L, zone(2L), 48.85, 2.35, 50);
        Deliverer tooSmall = deliverer(2L, centre, 48.85, 2.35, 2);
        when(repository.findByStatus(DelivererStatus.DISPONIBLE)).thenReturn(List.of(otherZone, tooSmall));

        assertThat(service.rankCandidates(order)).isEmpty();
        assertThatThrownBy(() -> service.selectBest(order)).isInstanceOf(BusinessException.class);
    }

    private static Zone zone(Long id) {
        Zone zone = new Zone();
        zone.setId(id);
        return zone;
    }

    private static Deliverer deliverer(Long id, Zone zone, double lat, double lon, double capacityKg) {
        Deliverer d = new Deliverer();
        d.setId(id);
        d.setZone(zone);
        d.setStatus(DelivererStatus.DISPONIBLE);
        d.setMaxCapacityKg(capacityKg);
        d.setMaxVolumeM3(1);
        d.setMaxActiveDeliveries(5);
        d.setLastLatitude(lat);
        d.setLastLongitude(lon);
        return d;
    }
}
