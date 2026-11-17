package com.example.delivery.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import java.time.Instant;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Embeddable
public class ProofOfDelivery {

    @Column(name = "proof_delivered_at")
    private Instant deliveredAt;

    @Column(name = "proof_receiver_name", length = 120)
    private String receiverName;

    @Column(name = "proof_confirmation_code", length = 20)
    private String confirmationCode;

    @Column(name = "proof_comment", length = 500)
    private String comment;
}
