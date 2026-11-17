import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { OrdersApi } from '../../core/api/orders.api';
import { StatisticsApi } from '../../core/api/statistics.api';
import { AuthService } from '../../core/auth.service';
import { StatusBadge } from '../../shared/status-badge';

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink, CurrencyPipe, StatusBadge],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page">
      <header class="page-head">
        <div>
          <h1>Bonjour {{ firstName() }}</h1>
          <p>Situation du jour.</p>
        </div>
        @if (isStaff()) { <a class="btn btn-signal" routerLink="/orders/new">Nouvelle commande</a> }
      </header>

      @if (isManager()) {
        <div class="grid grid-4">
          <div class="card stat"><span class="value">{{ stats.value()?.totalOrders ?? '–' }}</span><span class="label">Commandes du jour</span></div>
          <div class="card stat"><span class="value">{{ stats.value()?.deliveredCount ?? '–' }}</span><span class="label">Livrées</span></div>
          <div class="card stat"><span class="value">{{ stats.value()?.successRate ?? '–' }} %</span><span class="label">Taux de réussite</span></div>
          <div class="card stat"><span class="value">{{ revenue.value()?.totalRevenue ?? 0 | currency: 'EUR' }}</span><span class="label">Chiffre d'affaires</span></div>
        </div>
      }

      <div class="grid grid-2" [style.margin-top.rem]="isManager() ? 1 : 0">
        <section class="card">
          <h2>À assigner</h2>
          @for (o of pending.value()?.content ?? []; track o.id) {
            <a class="item" [routerLink]="['/orders', o.id]">
              <span><strong>{{ o.orderNumber }}</strong><br /><small class="muted">{{ o.customer.name }} → {{ o.zone.name }}</small></span>
              <span class="row"><app-badge kind="priority" [value]="o.priority" /><app-badge kind="order" [value]="o.status" /></span>
            </a>
          } @empty {
            <p class="empty">Aucune commande en attente.</p>
          }
        </section>
        <section class="card">
          <h2>En transit</h2>
          @for (o of inTransit.value()?.content ?? []; track o.id) {
            <a class="item" [routerLink]="['/orders', o.id]">
              <span><strong>{{ o.orderNumber }}</strong><br /><small class="muted">{{ o.customer.name }} → {{ o.zone.name }}</small></span>
              <span class="row"><app-badge kind="priority" [value]="o.priority" /><app-badge kind="order" [value]="o.status" /></span>
            </a>
          } @empty {
            <p class="empty">Aucune livraison en cours.</p>
          }
        </section>
      </div>
    </div>

  `,
  styles: `
    .item { display: flex; justify-content: space-between; align-items: center; gap: 1rem; padding: .7rem 0; border-bottom: 1px solid var(--line); color: inherit; text-decoration: none; }
    .item:last-child { border-bottom: 0; }
    .item:hover { background: #f7f9fa; }
  `,
})
export class Dashboard {
  private readonly auth = inject(AuthService);
  private readonly ordersApi = inject(OrdersApi);
  private readonly statsApi = inject(StatisticsApi);

  protected readonly firstName = computed(() => this.auth.session()?.fullName.split(' ')[0] ?? '');
  protected readonly isStaff = computed(() => this.auth.hasRole('ADMIN', 'MANAGER', 'OPERATOR'));
  protected readonly isManager = computed(() => this.auth.hasRole('ADMIN', 'MANAGER'));

  private readonly today = new Date().toISOString().slice(0, 10);

  protected readonly pending = rxResource({
    params: () => ({}),
    stream: () => this.ordersApi.search({ status: 'CREEE', size: 6, sort: 'plannedDate,asc' }),
  });
  protected readonly inTransit = rxResource({
    params: () => ({}),
    stream: () => this.ordersApi.search({ status: 'EN_TRANSIT', size: 6, sort: 'updatedAt,desc' }),
  });
  protected readonly stats = rxResource({
    params: () => (this.isManager() ? { period: 'DAY' as const, date: this.today } : undefined),
    stream: ({ params }) => this.statsApi.deliveries(params),
  });
  protected readonly revenue = rxResource({
    params: () => (this.isManager() ? { period: 'DAY' as const, date: this.today } : undefined),
    stream: ({ params }) => this.statsApi.revenue(params),
  });
}
