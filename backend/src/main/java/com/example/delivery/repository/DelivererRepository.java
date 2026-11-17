package com.example.delivery.repository;

import com.example.delivery.entity.Deliverer;
import com.example.delivery.entity.enums.DelivererStatus;
import jakarta.persistence.LockModeType;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface DelivererRepository extends JpaRepository<Deliverer, Long>, JpaSpecificationExecutor<Deliverer> {

    @Override
    @EntityGraph(attributePaths = "zone")
    Page<Deliverer> findAll(Specification<Deliverer> spec, Pageable pageable);

    @EntityGraph(attributePaths = "zone")
    List<Deliverer> findByStatus(DelivererStatus status);

    /** Verrou pessimiste : sérialise les attributions concurrentes d'un même livreur. */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select d from Deliverer d where d.id = :id")
    Optional<Deliverer> findByIdForUpdate(@Param("id") Long id);

    boolean existsByZoneId(Long zoneId);
}
