import { Routes } from '@angular/router';
import { authGuard, roleGuard } from './core/guards';
import { Role } from './core/models';

const STAFF: Role[] = ['ADMIN', 'MANAGER', 'OPERATOR'];
const MANAGERS: Role[] = ['ADMIN', 'MANAGER'];

export const routes: Routes = [
  { path: 'login', loadComponent: () => import('./features/auth/login').then((m) => m.Login) },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./layout/shell').then((m) => m.Shell),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      { path: 'dashboard', loadComponent: () => import('./features/dashboard/dashboard').then((m) => m.Dashboard) },

      { path: 'orders', loadComponent: () => import('./features/orders/orders-list').then((m) => m.OrdersList) },
      {
        path: 'orders/new',
        canActivate: [roleGuard],
        data: { roles: STAFF },
        loadComponent: () => import('./features/orders/order-form').then((m) => m.OrderForm),
      },
      {
        path: 'orders/:id/edit',
        canActivate: [roleGuard],
        data: { roles: STAFF },
        loadComponent: () => import('./features/orders/order-form').then((m) => m.OrderForm),
      },
      { path: 'orders/:id', loadComponent: () => import('./features/orders/order-detail').then((m) => m.OrderDetail) },

      {
        path: 'deliverers',
        canActivate: [roleGuard],
        data: { roles: STAFF },
        loadComponent: () => import('./features/deliverers/deliverers-list').then((m) => m.DeliverersList),
      },
      {
        path: 'deliverers/new',
        canActivate: [roleGuard],
        data: { roles: MANAGERS },
        loadComponent: () => import('./features/deliverers/deliverer-form').then((m) => m.DelivererForm),
      },
      {
        path: 'deliverers/:id/edit',
        canActivate: [roleGuard],
        data: { roles: MANAGERS },
        loadComponent: () => import('./features/deliverers/deliverer-form').then((m) => m.DelivererForm),
      },

      {
        path: 'customers',
        canActivate: [roleGuard],
        data: { roles: STAFF },
        loadComponent: () => import('./features/customers/customers-list').then((m) => m.CustomersList),
      },
      {
        path: 'customers/new',
        canActivate: [roleGuard],
        data: { roles: STAFF },
        loadComponent: () => import('./features/customers/customer-form').then((m) => m.CustomerForm),
      },
      {
        path: 'customers/:id/edit',
        canActivate: [roleGuard],
        data: { roles: STAFF },
        loadComponent: () => import('./features/customers/customer-form').then((m) => m.CustomerForm),
      },

      {
        path: 'incidents',
        canActivate: [roleGuard],
        data: { roles: STAFF },
        loadComponent: () => import('./features/incidents/incidents-list').then((m) => m.IncidentsList),
      },
      {
        path: 'statistics',
        canActivate: [roleGuard],
        data: { roles: MANAGERS },
        loadComponent: () => import('./features/statistics/statistics').then((m) => m.Statistics),
      },
      {
        path: 'admin',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN'] satisfies Role[] },
        loadComponent: () => import('./features/admin/admin').then((m) => m.Admin),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
