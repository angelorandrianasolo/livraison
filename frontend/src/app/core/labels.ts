import {
  DelivererStatus, IncidentType, OrderStatus, Priority, Role, StatsPeriod, VehicleType,
} from './models';

export type Tone = 'neutral' | 'info' | 'ok' | 'warn' | 'danger' | 'signal';
export interface Meta { label: string; tone: Tone }

export const ORDER_STATUS: Record<OrderStatus, Meta> = {
  CREEE: { label: 'Créée', tone: 'neutral' },
  ASSIGNEE: { label: 'Assignée', tone: 'info' },
  PRISE_EN_CHARGE: { label: 'Prise en charge', tone: 'info' },
  EN_TRANSIT: { label: 'En transit', tone: 'signal' },
  LIVREE: { label: 'Livrée', tone: 'ok' },
  ANNULEE: { label: 'Annulée', tone: 'neutral' },
  ECHEC_LIVRAISON: { label: 'Échec de livraison', tone: 'danger' },
  RETOURNEE: { label: 'Retournée', tone: 'warn' },
};
export const PRIORITY: Record<Priority, Meta> = {
  NORMALE: { label: 'Normale', tone: 'neutral' },
  URGENTE: { label: 'Urgente', tone: 'warn' },
  EXPRESS: { label: 'Express', tone: 'danger' },
};
export const DELIVERER_STATUS: Record<DelivererStatus, Meta> = {
  DISPONIBLE: { label: 'Disponible', tone: 'ok' },
  EN_LIVRAISON: { label: 'En livraison', tone: 'signal' },
  INDISPONIBLE: { label: 'Indisponible', tone: 'danger' },
  PAUSE: { label: 'En pause', tone: 'warn' },
};
export const INCIDENT_TYPE: Record<IncidentType, string> = {
  CLIENT_ABSENT: 'Client absent',
  ADRESSE_INCORRECTE: 'Adresse incorrecte',
  COLIS_ENDOMMAGE: 'Colis endommagé',
  VEHICULE_EN_PANNE: 'Véhicule en panne',
  REFUS_CLIENT: 'Refus du client',
};
export const VEHICLE: Record<VehicleType, string> = {
  VELO: 'Vélo', MOTO: 'Moto', VOITURE: 'Voiture', CAMIONNETTE: 'Camionnette',
};
export const ROLE: Record<Role, string> = {
  ADMIN: 'Administrateur', MANAGER: 'Responsable', OPERATOR: 'Opérateur', USER: 'Consultation',
};
export const PERIOD: Record<StatsPeriod, string> = { DAY: 'Jour', WEEK: 'Semaine', MONTH: 'Mois' };

export const keysOf = <T extends string>(record: Record<T, unknown>): T[] => Object.keys(record) as T[];
