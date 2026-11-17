package com.example.delivery.entity;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.example.delivery.entity.enums.OrderStatus;
import com.example.delivery.exception.InvalidOperationException;
import org.junit.jupiter.api.Test;

class OrderStatusTest {

    @Test
    void nominalWorkflowIsAllowed() {
        DeliveryOrder order = new DeliveryOrder();
        order.transitionTo(OrderStatus.ASSIGNEE);
        order.transitionTo(OrderStatus.PRISE_EN_CHARGE);
        order.transitionTo(OrderStatus.EN_TRANSIT);
        order.transitionTo(OrderStatus.LIVREE);
        assertThat(order.getStatus()).isEqualTo(OrderStatus.LIVREE);
    }

    @Test
    void deliveredOrderCannotGoBackToTransit() {
        DeliveryOrder order = new DeliveryOrder();
        order.setStatus(OrderStatus.LIVREE);
        assertThatThrownBy(() -> order.transitionTo(OrderStatus.EN_TRANSIT))
                .isInstanceOf(InvalidOperationException.class);
    }

    @Test
    void cannotSkipSteps() {
        DeliveryOrder order = new DeliveryOrder();
        assertThatThrownBy(() -> order.transitionTo(OrderStatus.LIVREE))
                .isInstanceOf(InvalidOperationException.class);
    }

    @Test
    void failedDeliveryCanBeReassigned() {
        assertThat(OrderStatus.ECHEC_LIVRAISON.canTransitionTo(OrderStatus.ASSIGNEE)).isTrue();
        assertThat(OrderStatus.LIVREE.isTerminal()).isTrue();
    }
}
