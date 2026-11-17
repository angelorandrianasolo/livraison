# Relais — Plateforme de gestion d'un service de livraison

Projet 5 du sujet « Framework Java » : gestion des clients, commandes, livreurs, attribution automatique,
tarification, suivi, incidents, preuve de livraison et statistiques.

| Couche | Technologies |
|---|---|
| Backend | Java 21, Spring Boot 3.5, Spring Security (JWT), Spring Data JPA, PostgreSQL, Bean Validation, springdoc-openapi |
| Frontend | Angular 22 : composants standalone, **signals**, `rxResource`, `linkedSignal`, RxJS, formulaires typés, guards/interceptors fonctionnels, lazy loading |
| Déploiement | Docker multi-stage, docker-compose (PostgreSQL + backend + nginx) |

## Démarrage rapide (Docker)

```bash
cp .env.example .env        # puis adapter DB_PASSWORD si besoin
docker compose up --build
```

* Application : <http://localhost:8081>
* Documentation de l'API (Swagger) : <http://localhost:8081/swagger-ui.html>

Comptes de démonstration (mot de passe `Passw0rd!`, créés si `SEED_DATA=true`) :
`admin`, `manager`, `operator`, `user`. **À désactiver / changer hors démonstration.**

## Développement local

```bash
# Backend (PostgreSQL requis sur localhost:5432, base « delivery »)
cd backend && mvn spring-boot:run

# Frontend (proxy /api → localhost:8080)
cd frontend && npm install && npm start      # http://localhost:4200
```

## Architecture backend (`com.example.delivery`)

```
config      propriétés typées (JWT, CORS, coefficients de score), seed de démonstration
controller/rest   AuthController, OrderController, DelivererController, CustomerController,
                  ZoneController, PricingController, IncidentController, StatisticsController, UserController
dto/request|response   records validés (@NotBlank, @Positive, @Email, @Size…) — aucune entité JPA exposée
entity (+ enums)   DeliveryOrder, Deliverer, Customer, Zone, Incident, TrackingEvent, PricingConfig, AppUser
repository  Spring Data + Specifications (recherche / filtres) + verrou pessimiste sur le livreur
service (+ impl)   interfaces et implémentations transactionnelles
exception   ResourceNotFound / Business / InvalidOperation / Conflict + GlobalExceptionHandler (@RestControllerAdvice)
mapper      entité → DTO
security    JWT, filtre d'authentification, matrice des droits
util        haversine, génération des numéros de commande, etc.
```

### Règles métier

* **Workflow** : `CREEE → ASSIGNEE → PRISE_EN_CHARGE → EN_TRANSIT → LIVREE`, états alternatifs
  `ANNULEE`, `ECHEC_LIVRAISON`, `RETOURNEE`. Les transitions autorisées sont définies une seule fois
  (`OrderStatus`) ; une commande `LIVREE` ne peut pas revenir `EN_TRANSIT` (HTTP 409).
* **Attribution automatique** : éligibles = `DISPONIBLE`, même zone, poids et volume compatibles, charge
  maximale non atteinte. Score 0-100 = moyenne pondérée de la proximité (haversine), de la charge restante et de
  la marge de capacité ; les commandes urgentes/express renforcent le poids de la proximité.
  Coefficients dans `application.yml` (`app.assignment.*`).
* **Prix** = (base + km × tarif + kg × tarif + m³ × tarif) × coefficient de priorité × (1 + majoration de zone) ;
  grille modifiable par l'ADMIN (`PUT /api/pricing/config`), estimation en direct dans le formulaire.
* **Transactions** : attribution, prise en charge, départ, livraison, annulation et signalement d'incident
  sont atomiques (statut + état du livreur + historique). Verrou pessimiste sur le livreur + `@Version`
  (optimistic locking) pour éviter les doubles attributions concurrentes.
* **Preuve de livraison** : date/heure, nom du réceptionnaire et code de confirmation obligatoires pour clôturer.
* **Incidents** : un incident en cours de livraison fait passer la commande en `ECHEC_LIVRAISON`
  (sauf « colis endommagé », simplement consigné) ; une panne rend le livreur `INDISPONIBLE`.
  Une commande en échec peut être réassignée ou retournée.

### Rôles

| Rôle | Droits |
|---|---|
| ADMIN | tout, + utilisateurs, zones, grille tarifaire |
| MANAGER | clients, livreurs (CRUD), commandes, annulation, incidents (résolution), statistiques |
| OPERATOR | création/modification de commandes, attribution, prise en charge, départ, livraison, incidents, statut des livreurs |
| USER | consultation des commandes et du suivi |

### API (extraits)

```
POST /api/auth/login
POST /api/orders                       201 Created (+ Location)        GET /api/orders?page=0&size=10&sort=createdAt,desc&status=CREEE&q=...
GET  /api/orders/{id}                  404 si inexistante
POST /api/orders/{id}/assign|pickup|start|deliver|cancel|return
GET  /api/orders/{id}/tracking         POST /api/orders/{id}/incidents
GET  /api/deliverers/available[?orderId=]   (classement par score pour une commande)
GET  /api/statistics/deliveries|revenue?period=DAY|WEEK|MONTH&date=yyyy-MM-dd&delivererId=&zoneId=
```

Format d'erreur unique : `{ timestamp, status, error, message, path, fieldErrors }`.

## Écarts et limites à connaître

* **Interface** : le sujet demande Thymeleaf ; ce projet utilise **Angular** à la place (choix explicite de la demande),
  l'API REST étant la seule couche d'accès à la couche métier.
* Le schéma est généré par Hibernate (`ddl-auto=update`) : pour une mise en production, passer à Flyway/Liquibase.
* Le jeton JWT est conservé dans `localStorage` (simplicité) ; en production, préférer un cookie `HttpOnly`.
* Les statistiques portent sur les commandes **créées** pendant la période.
