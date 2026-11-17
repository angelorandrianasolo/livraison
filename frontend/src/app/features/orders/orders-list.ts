import { CurrencyPipe, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, linkedSignal, signal } from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { OrdersApi } from '../../core/api/orders.api';
import { ZonesApi } from '../../core/api/zones.api';
import { AuthService } from '../../core/auth.service';
import { ORDER_STATUS, PRIORITY, keysOf } from '../../core/labels';
import { OrderStatus, Priority } from '../../core/models';
import { Pager } from '../../shared/pager';
import { StatusBadge } from '../../shared/status-badge';

@Component({
  selector: 'app-orders-list',
  imports: [RouterLink, ReactiveFormsModule, DatePipe, CurrencyPipe, StatusBadge, Pager],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page">
      <header class="page-head">
        <div>
          <h1>Commandes</h1>
          <p>Recherchez, filtrez et suivez toutes les livraisons.</p>
        </div>
        @if (auth.hasRole('ADMIN', 'MANAGER', 'OPERATOR')) {
          <a class="btn btn-signal" routerLink="/orders/new">Nouvelle commande</a>
        }
      </header>

      <div class="filters">
        <input class="input" type="search" placeholder="Numéro ou client" aria-label="Rechercher" [formControl]="searchControl" />
        <select class="input" aria-label="Statut" (change)="status.set(pick($event))">
          <option value="">Tous les statuts</option>
          @for (s of statuses; track s) { <option [value]="s">{{ labels[s].label }}</option> }
        </select>
        <select class="input" aria-label="Priorité" (change)="priority.set(pick($event))">
          <option value="">Toutes les priorités</option>
          @for (p of priorities; track p) { <option [value]="p">{{ priorityLabels[p].label }}</option> }
        </select>
      </div>

      <div class="card">
        @if (orders.error()) {
          <p class="alert">Impossible de charger les commandes.</p>
        } @else if (orders.value(); as result) {
          @if (result.content.length === 0) {
            <p class="empty">Aucune commande ne correspond à ces critères.</p>
          } @else {
            <div class="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Commande</th><th>Client</th><th>Zone</th><th>Priorité</th><th>Statut</th><th>Livreur</th>
                    <th class="sortable" (click)="toggleSort('plannedDate')">Prévue{{ arrow('plannedDate') }}</th>
                    <th class="sortable right" (click)="toggleSort('price')">Prix{{ arrow('price') }}</th>
                  </tr>
                </thead>
                <tbody>
                  @for (o of result.content; track o.id) {
                    <tr>
                      <td><a [routerLink]="['/orders', o.id]"><strong>{{ o.orderNumber }}</strong></a></td>
                      <td>{{ o.customer.name }}</td>
                      <td>{{ o.zone.name }}</td>
                      <td><app-badge kind="priority" [value]="o.priority" /></td>
                      <td><app-badge kind="order" [value]="o.status" /></td>
                      <td>{{ o.deliverer?.fullName ?? '—' }}</td>
                      <td class="mono">{{ o.plannedDate | date: 'dd/MM/yyyy' }}</td>
                      <td class="mono right">{{ o.price | currency: 'EUR' }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
            <app-pager [page]="result.page" [totalPages]="result.totalPages" [total]="result.totalElements" (pageChange)="page.set($event)" />
          }
        } @else {
          <p class="skeleton">Chargement…</p>
        }
      </div>
    </div>
  `,
})
export class OrdersList {
  private readonly api = inject(OrdersApi);
  protected readonly auth = inject(AuthService);

  protected readonly statuses = keysOf(ORDER_STATUS);
  protected readonly priorities = keysOf(PRIORITY);
  protected readonly labels = ORDER_STATUS;
  protected readonly priorityLabels = PRIORITY;

  protected readonly searchControl = new FormControl('', { nonNullable: true });
  private readonly q = toSignal(
    this.searchControl.valueChanges.pipe(debounceTime(300), distinctUntilChanged()),
    { initialValue: '' },
  );
  protected readonly status = signal<OrderStatus | ''>('');
  protected readonly priority = signal<Priority | ''>('');
  protected readonly sort = signal('createdAt,desc');

  /** Revient à la première page dès qu'un critère change. */
  protected readonly page = linkedSignal({
    source: () => ({ q: this.q(), status: this.status(), priority: this.priority(), sort: this.sort() }),
    computation: () => 0,
  });

  protected readonly orders = rxResource({
    params: () => ({
      q: this.q(), status: this.status(), priority: this.priority(), sort: this.sort(), page: this.page(),
    }),
    stream: ({ params }) => this.api.search({ ...params, size: 10 }),
  });

  protected pick<T extends string>(event: Event): T | '' {
    return (event.target as HTMLSelectElement).value as T | '';
  }

  protected toggleSort(field: string): void {
    const [current, direction] = this.sort().split(',');
    this.sort.set(`${field},${current === field && direction === 'asc' ? 'desc' : 'asc'}`);
  }

  protected arrow(field: string): string {
    const [current, direction] = this.sort().split(',');
    return current === field ? (direction === 'asc' ? ' ↑' : ' ↓') : '';
  }
}
