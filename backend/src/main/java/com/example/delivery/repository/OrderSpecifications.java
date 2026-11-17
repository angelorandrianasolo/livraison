package com.example.delivery.repository;

import com.example.delivery.dto.request.OrderFilter;
import com.example.delivery.entity.Customer;
import com.example.delivery.entity.DeliveryOrder;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.List;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

public final class OrderSpecifications {

    private OrderSpecifications() {
    }

    public static Specification<DeliveryOrder> withFilter(OrderFilter f) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (f.status() != null) {
                predicates.add(cb.equal(root.get("status"), f.status()));
            }
            if (f.priority() != null) {
                predicates.add(cb.equal(root.get("priority"), f.priority()));
            }
            if (f.zoneId() != null) {
                predicates.add(cb.equal(root.get("zone").get("id"), f.zoneId()));
            }
            if (f.delivererId() != null) {
                predicates.add(cb.equal(root.get("deliverer").get("id"), f.delivererId()));
            }
            if (f.customerId() != null) {
                predicates.add(cb.equal(root.get("customer").get("id"), f.customerId()));
            }
            if (f.from() != null) {
                Instant start = f.from().atStartOfDay(ZoneOffset.UTC).toInstant();
                predicates.add(cb.greaterThanOrEqualTo(root.get("createdAt"), start));
            }
            if (f.to() != null) {
                Instant end = f.to().plusDays(1).atStartOfDay(ZoneOffset.UTC).toInstant();
                predicates.add(cb.lessThan(root.get("createdAt"), end));
            }
            if (StringUtils.hasText(f.q())) {
                Join<DeliveryOrder, Customer> customer = root.join("customer", JoinType.LEFT);
                String like = "%" + f.q().trim().toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("orderNumber")), like),
                        cb.like(cb.lower(customer.get("name")), like)));
            }
            return cb.and(predicates.toArray(Predicate[]::new));
        };
    }
}
