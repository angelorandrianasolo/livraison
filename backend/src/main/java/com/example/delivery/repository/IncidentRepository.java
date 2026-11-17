package com.example.delivery.repository;

import com.example.delivery.entity.Incident;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface IncidentRepository extends JpaRepository<Incident, Long> {

    @Override
    @EntityGraph(attributePaths = {"order", "deliverer"})
    Page<Incident> findAll(Pageable pageable);

    @EntityGraph(attributePaths = {"order", "deliverer"})
    Page<Incident> findByResolved(boolean resolved, Pageable pageable);

    @EntityGraph(attributePaths = {"order", "deliverer"})
    java.util.List<Incident> findByOrderIdOrderByCreatedAtDesc(Long orderId);
}
