package com.example.delivery.service.impl;

import com.example.delivery.dto.request.CreateOrderRequest;
import com.example.delivery.dto.request.DeliverOrderRequest;
import com.example.delivery.dto.request.OrderFilter;
import com.example.delivery.dto.request.PriceEstimateRequest;
import com.example.delivery.dto.request.UpdateOrderRequest;
import com.example.delivery.dto.response.OrderResponse;
import com.example.delivery.dto.response.PageResponse;
import com.example.delivery.dto.response.TrackingEventResponse;
import com.example.delivery.entity.Customer;
import com.example.delivery.entity.Deliverer;
import com.example.delivery.entity.DeliveryOrder;
import com.example.delivery.entity.ProofOfDelivery;
import com.example.delivery.entity.Zone;
import com.example.delivery.entity.enums.OrderStatus;
import com.example.delivery.entity.enums.Priority;
import com.example.delivery.exception.BusinessException;
import com.example.delivery.exception.InvalidOperationException;
import com.example.delivery.exception.ResourceNotFoundException;
import com.example.delivery.mapper.OrderMapper;
import com.example.delivery.mapper.TrackingEventMapper;
import com.example.delivery.repository.CustomerRepository;
import com.example.delivery.repository.DelivererRepository;
import com.example.delivery.repository.OrderRepository;
import com.example.delivery.repository.OrderSpecifications;
import com.example.delivery.repository.TrackingEventRepository;
import com.example.delivery.repository.ZoneRepository;
import com.example.delivery.service.AssignmentService;
import com.example.delivery.service.OrderService;
import com.example.delivery.service.PricingService;
import com.example.delivery.util.OrderNumberGenerator;
import java.math.BigDecimal;
import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

/**
 * Chaque opération métier critique (attribution, prise en charge, départ, livraison, annulation)
 * s'exécute dans une unique transaction : changement de statut, état du livreur et historique sont atomiques.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final CustomerRepository customerRepository;
    private final ZoneRepository zoneRepository;
    private final DelivererRepository delivererRepository;
    private final TrackingEventRepository trackingEventRepository;
    private final AssignmentService assignmentService;
    private final PricingService pricingService;
    private final DelivererWorkload workload;
    private final TrackingRecorder tracker;
    private final OrderMapper orderMapper;
    private final TrackingEventMapper trackingMapper;
    private final Clock clock;

    @Override
    public PageResponse<OrderResponse> search(OrderFilter filter, Pageable pageable) {
        return PageResponse.from(orderRepository.findAll(OrderSpecifications.withFilter(filter), pageable)
                .map(orderMapper::toResponse));
    }

    @Override
    public OrderResponse get(Long id) {
        return orderMapper.toResponse(find(id));
    }

    @Override
    @Transactional
    public OrderResponse create(CreateOrderRequest r) {
        Customer customer = customerRepository.findById(r.customerId())
                .orElseThrow(() -> new ResourceNotFoundException("Client", r.customerId()));
        DeliveryOrder order = new DeliveryOrder();
        order.setCustomer(customer);
        order.setOrderNumber(uniqueOrderNumber());
        order.setStatus(OrderStatus.CREEE);
        fill(order, r.pickupAddress(), r.deliveryAddress(), r.pickupLatitude(), r.pickupLongitude(), r.weightKg(),
                r.volumeM3(), r.priority(), r.distanceKm(), r.zoneId(), r.plannedDate());
        DeliveryOrder saved = orderRepository.save(order);
        tracker.record(saved, OrderStatus.CREEE, "Commande créée");
        return orderMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public OrderResponse update(Long id, UpdateOrderRequest r) {
        DeliveryOrder order = find(id);
        if (order.getStatus() != OrderStatus.CREEE) {
            throw new InvalidOperationException("Seule une commande au statut CREEE peut être modifiée");
        }
        fill(order, r.pickupAddress(), r.deliveryAddress(), r.pickupLatitude(), r.pickupLongitude(), r.weightKg(),
                r.volumeM3(), r.priority(), r.distanceKm(), r.zoneId(), r.plannedDate());
        return orderMapper.toResponse(order);
    }

    @Override
    @Transactional
    public OrderResponse assign(Long id, Long delivererId) {
        DeliveryOrder order = find(id);
        if (!order.getStatus().canTransitionTo(OrderStatus.ASSIGNEE)) {
            throw new InvalidOperationException(
                    "Une commande au statut %s ne peut pas être assignée".formatted(order.getStatus()));
        }
        Long targetId = delivererId != null ? delivererId : assignmentService.selectBest(order).getId();
        Deliverer deliverer = delivererRepository.findByIdForUpdate(targetId)
                .orElseThrow(() -> new ResourceNotFoundException("Livreur", targetId));
        assignmentService.assertEligible(order, deliverer);

        order.setDeliverer(deliverer);
        order.transitionTo(OrderStatus.ASSIGNEE);
        tracker.record(order, OrderStatus.ASSIGNEE, "Assignée à " + deliverer.getFullName()
                + (delivererId == null ? " (attribution automatique)" : ""));
        return orderMapper.toResponse(order);
    }

    @Override
    @Transactional
    public OrderResponse pickup(Long id) {
        DeliveryOrder order = find(id);
        order.transitionTo(OrderStatus.PRISE_EN_CHARGE);
        tracker.record(order, OrderStatus.PRISE_EN_CHARGE, "Colis récupéré par " + order.getDeliverer().getFullName());
        return orderMapper.toResponse(order);
    }

    @Override
    @Transactional
    public OrderResponse start(Long id) {
        DeliveryOrder order = find(id);
        order.transitionTo(OrderStatus.EN_TRANSIT);
        workload.markBusy(order.getDeliverer());
        tracker.record(order, OrderStatus.EN_TRANSIT, "Livraison en cours");
        return orderMapper.toResponse(order);
    }

    @Override
    @Transactional
    public OrderResponse deliver(Long id, DeliverOrderRequest r) {
        if (!StringUtils.hasText(r.receiverName()) || !StringUtils.hasText(r.confirmationCode())) {
            throw new BusinessException("Le nom du réceptionnaire et le code de confirmation sont obligatoires");
        }
        DeliveryOrder order = find(id);
        order.transitionTo(OrderStatus.LIVREE);
        Instant deliveredAt = r.deliveredAt() != null ? r.deliveredAt() : clock.instant();
        order.setProof(new ProofOfDelivery(deliveredAt, r.receiverName().trim(), r.confirmationCode().trim(),
                StringUtils.hasText(r.comment()) ? r.comment().trim() : null));
        workload.releaseIfIdle(order.getDeliverer(), order.getId());
        tracker.record(order, OrderStatus.LIVREE, "Remise à " + r.receiverName().trim());
        return orderMapper.toResponse(order);
    }

    @Override
    @Transactional
    public OrderResponse cancel(Long id, String reason) {
        DeliveryOrder order = find(id);
        order.transitionTo(OrderStatus.ANNULEE);
        if (order.getDeliverer() != null) {
            workload.releaseIfIdle(order.getDeliverer(), order.getId());
        }
        tracker.record(order, OrderStatus.ANNULEE, StringUtils.hasText(reason) ? reason.trim() : "Commande annulée");
        return orderMapper.toResponse(order);
    }

    @Override
    @Transactional
    public OrderResponse markReturned(Long id) {
        DeliveryOrder order = find(id);
        order.transitionTo(OrderStatus.RETOURNEE);
        tracker.record(order, OrderStatus.RETOURNEE, "Colis retourné à l'expéditeur");
        return orderMapper.toResponse(order);
    }

    @Override
    public List<TrackingEventResponse> tracking(Long id) {
        find(id);
        return trackingEventRepository.findByOrderIdOrderByCreatedAtAsc(id).stream()
                .map(trackingMapper::toResponse).toList();
    }

    private DeliveryOrder find(Long id) {
        return orderRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Commande", id));
    }

    private void fill(DeliveryOrder order, String pickup, String delivery, Double lat, Double lon, double kg,
                      double m3, Priority priority, double km, Long zoneId, LocalDate plannedDate) {
        Zone zone = zoneRepository.findById(zoneId).orElseThrow(() -> new ResourceNotFoundException("Zone", zoneId));
        BigDecimal price = pricingService.estimate(new PriceEstimateRequest(zoneId, km, kg, m3, priority)).total();
        order.setPickupAddress(pickup.trim());
        order.setDeliveryAddress(delivery.trim());
        order.setPickupLatitude(lat);
        order.setPickupLongitude(lon);
        order.setWeightKg(kg);
        order.setVolumeM3(m3);
        order.setPriority(priority);
        order.setDistanceKm(km);
        order.setZone(zone);
        order.setPrice(price);
        order.setPlannedDate(plannedDate);
    }

    private String uniqueOrderNumber() {
        String number;
        do {
            number = OrderNumberGenerator.next(LocalDate.now(clock));
        } while (orderRepository.existsByOrderNumber(number));
        return number;
    }
}
