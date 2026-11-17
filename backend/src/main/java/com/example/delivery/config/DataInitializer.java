package com.example.delivery.config;

import com.example.delivery.dto.request.CreateOrderRequest;
import com.example.delivery.dto.request.CreateUserRequest;
import com.example.delivery.dto.request.CustomerRequest;
import com.example.delivery.dto.request.DelivererRequest;
import com.example.delivery.dto.request.ZoneRequest;
import com.example.delivery.dto.response.CustomerResponse;
import com.example.delivery.dto.response.ZoneResponse;
import com.example.delivery.entity.enums.Priority;
import com.example.delivery.entity.enums.Role;
import com.example.delivery.entity.enums.VehicleType;
import com.example.delivery.repository.UserRepository;
import com.example.delivery.service.CustomerService;
import com.example.delivery.service.DelivererService;
import com.example.delivery.service.OrderService;
import com.example.delivery.service.UserService;
import com.example.delivery.service.ZoneService;
import java.math.BigDecimal;
import java.time.LocalDate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

/**
 * Données de démonstration, insérées une seule fois (désactivable avec SEED_DATA=false).
 * Tous les comptes ont le mot de passe « Passw0rd! » : à changer hors démonstration.
 */
@Slf4j
@Component
@RequiredArgsConstructor
@ConditionalOnProperty(prefix = "app.seed", name = "enabled", havingValue = "true")
public class DataInitializer implements ApplicationRunner {

    private static final String PASSWORD = "Passw0rd!";

    private final UserRepository userRepository;
    private final UserService userService;
    private final ZoneService zoneService;
    private final CustomerService customerService;
    private final DelivererService delivererService;
    private final OrderService orderService;

    @Override
    public void run(ApplicationArguments args) {
        if (userRepository.count() > 0) {
            return;
        }
        userService.create(new CreateUserRequest("admin", PASSWORD, "Alice Admin", Role.ADMIN));
        userService.create(new CreateUserRequest("manager", PASSWORD, "Marc Manager", Role.MANAGER));
        userService.create(new CreateUserRequest("operator", PASSWORD, "Olivia Opératrice", Role.OPERATOR));
        userService.create(new CreateUserRequest("user", PASSWORD, "Ulysse Utilisateur", Role.USER));

        ZoneResponse centre = zoneService.create(new ZoneRequest("CENTRE", "Centre-ville", BigDecimal.ZERO));
        ZoneResponse nord = zoneService.create(new ZoneRequest("NORD", "Zone Nord", new BigDecimal("0.10")));
        zoneService.create(new ZoneRequest("SUD", "Zone Sud", new BigDecimal("0.15")));

        delivererService.create(new DelivererRequest("Karim", "Benali", "0611223344", VehicleType.MOTO, centre.id(),
                40, 0.4, 6, 48.8570, 2.3510));
        delivererService.create(new DelivererRequest("Sophie", "Martin", "0622334455", VehicleType.VELO, centre.id(),
                15, 0.1, 4, 48.8600, 2.3400));
        delivererService.create(new DelivererRequest("Yanis", "Dupont", "0633445566", VehicleType.CAMIONNETTE, centre.id(),
                800, 12, 8, 48.8500, 2.3600));
        delivererService.create(new DelivererRequest("Léa", "Moreau", "0644556677", VehicleType.VOITURE, nord.id(),
                200, 3, 6, 48.8900, 2.3500));

        CustomerResponse c1 = customerService.create(new CustomerRequest("Boulangerie Lumière", "contact@lumiere.example",
                "0140000001", "12 rue des Écoles, 75005 Paris"));
        CustomerResponse c2 = customerService.create(new CustomerRequest("Atelier Cobalt", "hello@cobalt.example",
                "0140000002", "8 avenue de Flandre, 75019 Paris"));
        customerService.create(new CustomerRequest("Pharmacie du Marché", "pharma@marche.example",
                "0140000003", "3 place du Marché, 75018 Paris"));

        LocalDate today = LocalDate.now();
        orderService.create(new CreateOrderRequest(c1.id(), "12 rue des Écoles, Paris", "27 rue Monge, Paris",
                48.8495, 2.3470, 3.5, 0.02, Priority.NORMALE, 2.4, centre.id(), today));
        orderService.create(new CreateOrderRequest(c2.id(), "8 avenue de Flandre, Paris", "5 rue Ordener, Paris",
                48.8890, 2.3790, 12, 0.08, Priority.URGENTE, 4.1, nord.id(), today));
        orderService.create(new CreateOrderRequest(c1.id(), "12 rue des Écoles, Paris", "90 boulevard Saint-Michel, Paris",
                48.8495, 2.3470, 25, 0.3, Priority.EXPRESS, 1.8, centre.id(), today));
        log.info("Données de démonstration créées (comptes : admin, manager, operator, user).");
    }
}
