package com.example.delivery.repository;

import com.example.delivery.entity.TrackingEvent;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TrackingEventRepository extends JpaRepository<TrackingEvent, Long> {

    List<TrackingEvent> findByOrderIdOrderByCreatedAtAsc(Long orderId);
}
