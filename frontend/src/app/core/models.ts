export type Role = 'ADMIN' | 'MANAGER' | 'OPERATOR' | 'USER';
export type OrderStatus =
  | 'CREEE' | 'ASSIGNEE' | 'PRISE_EN_CHARGE' | 'EN_TRANSIT' | 'LIVREE'
  | 'ANNULEE' | 'ECHEC_LIVRAISON' | 'RETOURNEE';
export type Priority = 'NORMALE' | 'URGENTE' | 'EXPRESS';
export type DelivererStatus = 'DISPONIBLE' | 'EN_LIVRAISON' | 'INDISPONIBLE' | 'PAUSE';
export type VehicleType = 'VELO' | 'MOTO' | 'VOITURE' | 'CAMIONNETTE';
export type IncidentType =
  | 'CLIENT_ABSENT' | 'ADRESSE_INCORRECTE' | 'COLIS_ENDOMMAGE' | 'VEHICULE_EN_PANNE' | 'REFUS_CLIENT';
export type StatsPeriod = 'DAY' | 'WEEK' | 'MONTH';

export interface Session {
  token: string;
  expiresAt: string;
  username: string;
  fullName: string;
  role: Role;
}

export interface Page<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface ApiError {
  status: number;
  message: string;
  fieldErrors?: Record<string, string> | null;
}

export interface Zone { id: number; code: string; name: string; surchargeRate: number }
export interface ZoneRequest { code: string; name: string; surchargeRate: number }

export interface Customer { id: number; name: string; email: string; phone: string; address: string }
export type CustomerRequest = Omit<Customer, 'id'>;

export interface Deliverer {
  id: number;
  firstName: string;
  lastName: string;
  fullName: string;
  phone: string;
  vehicleType: VehicleType;
  zone: Zone;
  status: DelivererStatus;
  maxCapacityKg: number;
  maxVolumeM3: number;
  maxActiveDeliveries: number;
  lastLatitude: number | null;
  lastLongitude: number | null;
}
export interface DelivererRequest {
  firstName: string;
  lastName: string;
  phone: string;
  vehicleType: VehicleType;
  zoneId: number;
  maxCapacityKg: number;
  maxVolumeM3: number;
  maxActiveDeliveries: number;
  lastLatitude: number | null;
  lastLongitude: number | null;
}
export interface DelivererCandidate {
  deliverer: Deliverer;
  score: number | null;
  distanceKm: number | null;
  activeDeliveries: number;
}

export interface Proof {
  deliveredAt: string;
  receiverName: string;
  confirmationCode: string;
  comment: string | null;
}
export interface Order {
  id: number;
  orderNumber: string;
  status: OrderStatus;
  allowedTransitions: OrderStatus[];
  priority: Priority;
  customer: { id: number; name: string };
  pickupAddress: string;
  deliveryAddress: string;
  pickupLatitude: number | null;
  pickupLongitude: number | null;
  weightKg: number;
  volumeM3: number;
  distanceKm: number;
  zone: Zone;
  price: number;
  plannedDate: string;
  deliverer: { id: number; fullName: string; phone: string } | null;
  proof: Proof | null;
  createdAt: string;
  updatedAt: string;
}
export interface OrderRequest {
  customerId: number;
  pickupAddress: string;
  deliveryAddress: string;
  pickupLatitude: number | null;
  pickupLongitude: number | null;
  weightKg: number;
  volumeM3: number;
  priority: Priority;
  distanceKm: number;
  zoneId: number;
  plannedDate: string;
}
export interface OrderQuery {
  q?: string;
  status?: OrderStatus | '';
  priority?: Priority | '';
  zoneId?: number | null;
  page?: number;
  size?: number;
  sort?: string;
}
export interface DeliverRequest { receiverName: string; confirmationCode: string; comment?: string }

export interface TrackingEvent {
  id: number;
  status: OrderStatus;
  note: string | null;
  actor: string;
  occurredAt: string;
}

export interface Incident {
  id: number;
  type: IncidentType;
  description: string;
  occurredAt: string;
  orderId: number;
  orderNumber: string;
  delivererId: number;
  delivererName: string;
  resolution: string | null;
  resolved: boolean;
  resolvedAt: string | null;
}

export interface PricingConfig {
  baseFee: number;
  pricePerKm: number;
  pricePerKg: number;
  pricePerM3: number;
  urgentMultiplier: number;
  expressMultiplier: number;
}
export interface PriceEstimateRequest {
  zoneId: number;
  distanceKm: number;
  weightKg: number;
  volumeM3: number;
  priority: Priority;
}
export interface PriceBreakdown {
  baseFee: number;
  distanceCost: number;
  weightCost: number;
  volumeCost: number;
  subtotal: number;
  priorityMultiplier: number;
  zoneSurchargeRate: number;
  total: number;
}

export interface StatsQuery {
  period: StatsPeriod;
  date: string;
  delivererId?: number | null;
  zoneId?: number | null;
}
export interface DeliveryStats {
  from: string;
  to: string;
  totalOrders: number;
  deliveredCount: number;
  failedCount: number;
  cancelledCount: number;
  successRate: number;
  failureRate: number;
  averageDeliveryMinutes: number;
  totalDistanceKm: number;
  deliveriesPerDeliverer: { delivererId: number; delivererName: string; deliveries: number }[];
}
export interface RevenueStats {
  from: string;
  to: string;
  deliveredCount: number;
  totalRevenue: number;
  averageRevenue: number;
  revenueByDay: { date: string; amount: number }[];
}
