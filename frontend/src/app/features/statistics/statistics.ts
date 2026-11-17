import { CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { DeliverersApi } from '../../core/api/deliverers.api';
import { StatisticsApi } from '../../core/api/statistics.api';
import { ZonesApi } from '../../core/api/zones.api';
import { PERIOD, keysOf } from '../../core/labels';
import { StatsPeriod, StatsQuery } from '../../core/models';

@Component({
  selector: 'app-statistics',
  imports: [CurrencyPipe, DatePipe, DecimalPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page">
      <header class="page-head">
        <div>
          <h1>Statistiques</h1>
          @if (deliveries.value(); as d) {
            <p>Du {{ d.from | date: 'dd/MM/yyyy' }} au {{ d.to | date: 'dd/MM/yyyy' }} · commandes créées sur la période</p>
          }
        </div>
      </header>

      <div class="filters">
        <select class="input" aria-label="Période" (change)="period.set(pickPeriod($event))">
          @for (p of periods; track p) { <option [value]="p" [selected]="p === period()">{{ periodLabels[p] }}</option> }
        </select>
        <input class="input" type="date" aria-label="Date de référence" [value]="date()" (change)="date.set(pickValue($event))" />
        <select class="input" aria-label="Livreur" (change)="delivererId.set(pickId($event))">
          <option value="">Tous les livreurs</option>
          @for (d of deliverers(); track d.id) { <option [value]="d.id">{{ d.fullName }}</option> }
        </select>
        <select class="input" aria-label="Zone" (change)="zoneId.set(pickId($event))">
          <option value="">Toutes les zones</option>
          @for (z of zones(); track z.id) { <option [value]="z.id">{{ z.name }}</option> }
        </select>
      </div>

      @if (deliveries.value(); as d) {
        <div class="grid grid-4">
          <div class="card stat"><span class="value">{{ d.deliveredCount }}</span><span class="label">Livraisons réussies</span></div>
          <div class="card stat"><span class="value">{{ d.successRate }} %</span><span class="label">Taux de réussite</span></div>
          <div class="card stat"><span class="value">{{ d.failureRate }} %</span><span class="label">Taux d'échec</span></div>
          <div class="card stat"><span class="value">{{ d.averageDeliveryMinutes | number: '1.0-0' }} min</span><span class="label">Délai moyen</span></div>
          <div class="card stat"><span class="value">{{ revenue.value()?.totalRevenue ?? 0 | currency: 'EUR' }}</span><span class="label">Chiffre d'affaires</span></div>
          <div class="card stat"><span class="value">{{ revenue.value()?.averageRevenue ?? 0 | currency: 'EUR' }}</span><span class="label">Revenu moyen / livraison</span></div>
          <div class="card stat"><span class="value">{{ d.totalDistanceKm | number: '1.0-1' }} km</span><span class="label">Distance parcourue</span></div>
          <div class="card stat"><span class="value">{{ d.totalOrders }}</span><span class="label">Commandes ({{ d.cancelledCount }} annulées)</span></div>
        </div>

        <div class="grid grid-2" style="margin-top:1rem">
          <section class="card">
            <h2>Chiffre d'affaires par jour</h2>
            @if (bars().length === 0) {
              <p class="empty">Aucune livraison sur la période.</p>
            } @else {
              <div class="bars" role="img" aria-label="Chiffre d'affaires quotidien">
                @for (b of bars(); track b.date) {
                  <div class="bar-col">
                    <span class="mono amount">{{ b.amount | number: '1.0-0' }}</span>
                    <div class="bar" [style.height.%]="b.height"></div>
                    <span class="day">{{ b.date | date: 'dd/MM' }}</span>
                  </div>
                }
              </div>
            }
          </section>
          <section class="card">
            <h2>Livraisons par livreur</h2>
            @if (d.deliveriesPerDeliverer.length === 0) {
              <p class="empty">Aucune livraison sur la période.</p>
            } @else {
              <table>
                <thead><tr><th>Livreur</th><th class="right">Livraisons</th></tr></thead>
                <tbody>
                  @for (row of d.deliveriesPerDeliverer; track row.delivererId) {
                    <tr><td>{{ row.delivererName }}</td><td class="mono right"><strong>{{ row.deliveries }}</strong></td></tr>
                  }
                </tbody>
              </table>
            }
          </section>
        </div>
      } @else if (deliveries.error()) {
        <p class="alert">Impossible de charger les statistiques.</p>
      } @else {
        <p class="skeleton">Chargement…</p>
      }
    </div>
  `,
  styles: `
    .bars { display: flex; align-items: flex-end; gap: .6rem; height: 220px; padding-top: 1rem; overflow-x: auto; }
    .bar-col { flex: 1; min-width: 44px; height: 100%; display: flex; flex-direction: column; justify-content: flex-end; align-items: center; gap: .25rem; }
    .bar { width: 100%; background: var(--signal); border-bottom: 3px solid var(--ink); min-height: 2px; }
    .amount { font-size: .78rem; color: var(--steel); }
    .day { font-size: .78rem; color: var(--steel); }
  `,
})
export class Statistics {
  private readonly api = inject(StatisticsApi);

  protected readonly periods = keysOf(PERIOD);
  protected readonly periodLabels = PERIOD;
  protected readonly deliverers = toSignal(
    inject(DeliverersApi).search({ size: 100 }).pipe(map((p) => p.content)), { initialValue: [] },
  );
  protected readonly zones = toSignal(inject(ZonesApi).list(), { initialValue: [] });

  protected readonly period = signal<StatsPeriod>('DAY');
  protected readonly date = signal(new Date().toISOString().slice(0, 10));
  protected readonly delivererId = signal<number | null>(null);
  protected readonly zoneId = signal<number | null>(null);

  private readonly query = computed<StatsQuery>(() => ({
    period: this.period(),
    date: this.date(),
    delivererId: this.delivererId(),
    zoneId: this.zoneId(),
  }));

  protected readonly deliveries = rxResource({ params: () => this.query(), stream: ({ params }) => this.api.deliveries(params) });
  protected readonly revenue = rxResource({ params: () => this.query(), stream: ({ params }) => this.api.revenue(params) });

  protected readonly bars = computed(() => {
    const days = this.revenue.value()?.revenueByDay ?? [];
    const max = Math.max(...days.map((d) => d.amount), 1);
    return days.map((d) => ({ ...d, height: Math.max((d.amount / max) * 80, 3) }));
  });

  protected pickPeriod(e: Event): StatsPeriod { return (e.target as HTMLSelectElement).value as StatsPeriod; }
  protected pickValue(e: Event): string { return (e.target as HTMLInputElement).value || new Date().toISOString().slice(0, 10); }
  protected pickId(e: Event): number | null {
    const v = (e.target as HTMLSelectElement).value;
    return v ? Number(v) : null;
  }
}
