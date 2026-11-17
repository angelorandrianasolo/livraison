package com.example.delivery.repository;

import com.example.delivery.entity.DeliveryOrder;
import com.example.delivery.entity.enums.OrderStatus;
import java.util.Collection;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface OrderRepository extends JpaRepository<DeliveryOrder, Long>, JpaSpecificationExecutor<DeliveryOrder> {

    @Override
    @EntityGraph(attributePaths = {"customer", "zone", "deliverer"})
    Page<DeliveryOrder> findAll(Specification<DeliveryOrder> spec, Pageable pageable);

    @Override
    @EntityGraph(attributePaths = {"customer", "zone", "deliverer"})
    List<DeliveryOrder> findAll(Specification<DeliveryOrder> spec);

    @EntityGraph(attributePaths = {"customer", "zone", "deliverer"})
    List<DeliveryOrder> findByStatusOrderByCreatedAtAsc(OrderStatus status);

    long countByDelivererIdAndStatusIn(Long delivererId, Collection<OrderStatus> statuses);

    long countByDelivererIdAndStatusAndIdNot(Long delivererId, OrderStatus status, Long excludedId);

    boolean existsByOrderNumber(String orderNumber);

    boolean existsByCustomerId(Long customerId);

    boolean existsByDelivererId(Long delivererId);

    boolean existsByZoneId(Long zoneId);
}
