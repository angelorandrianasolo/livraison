import { ChangeDetectionStrategy, Component, inject, linkedSignal, signal } from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { DeliverersApi } from '../../core/api/deliverers.api';
import { ZonesApi } from '../../core/api/zones.api';
import { AuthService } from '../../core/auth.service';
import { errorMessage } from '../../core/errors';
import { DELIVERER_STATUS, VEHICLE, keysOf } from '../../core/labels';
import { Deliverer, DelivererStatus } from '../../core/models';
import { ToastService } from '../../core/toast.service';
import { Pager } from '../../shared/pager';
import { StatusBadge } from '../../shared/status-badge';

@Component({
  selector: 'app-deliverers-list',
  imports: [RouterLink, ReactiveFormsModule, StatusBadge, Pager],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page">
      <header class="page-head">
        <div>
          <h1>Livreurs</h1>
          <p>Disponibilité et capacité de la flotte.</p>
        </div>
        @if (canManage()) { <a class="btn btn-signal" routerLink="/deliverers/new">Nouveau livreur</a> }
      </header>

      <div class="filters">
        <input class="input" type="search" placeholder="Nom ou téléphone" aria-label="Rechercher" [formControl]="searchControl" />
        <select class="input" aria-label="Statut" (change)="status.set(pick($event))">
          <option value="">Tous les statuts</option>
          @for (s of statuses; track s) { <option [value]="s">{{ statusLabels[s].label }}</option> }
        </select>
        <select class="input" aria-label="Zone" (change)="zoneId.set(pickNumber($event))">
          <option value="">Toutes les zones</option>
          @for (z of zones(); track z.id) { <option [value]="z.id">{{ z.name }}</option> }
        </select>
      </div>

      <div class="card">
        @if (list.error()) {
          <p class="alert">Impossible de charger les livreurs.</p>
        } @else if (list.value(); as result) {
          @if (result.content.length === 0) {
            <p class="empty">Aucun livreur ne correspond à ces critères.</p>
          } @else {
            <div class="table-wrap">
              <table>
                <thead><tr><th>Livreur</th><th>Téléphone</th><th>Véhicule</th><th>Zone</th><th>Capacité</th><th>Statut</th><th></th></tr></thead>
                <tbody>
                  @for (d of result.content; track d.id) {
                    <tr>
                      <td><strong>{{ d.fullName }}</strong></td>
                      <td class="mono">{{ d.phone }}</td>
                      <td>{{ vehicle[d.vehicleType] }}</td>
                      <td>{{ d.zone.name }}</td>
                      <td class="mono">{{ d.maxCapacityKg }} kg · {{ d.maxVolumeM3 }} m³ · {{ d.maxActiveDeliveries }} liv.</td>
                      <td>
                        @if (d.status === 'EN_LIVRAISON') {
                          <app-badge kind="deliverer" value="EN_LIVRAISON" />
                        } @else {
                          <select class="input" [attr.aria-label]="'Statut de ' + d.fullName" (change)="changeStatus(d, pick($event))">
                            @for (s of editableStatuses; track s) {
                              <option [value]="s" [selected]="s === d.status">{{ statusLabels[s].label }}</option>
                            }
                          </select>
                        }
                      </td>
                      <td class="actions">
                        @if (canManage()) {
                          <a class="btn btn-ghost btn-sm" [routerLink]="['/deliverers', d.id, 'edit']">Modifier</a>
                          <button type="button" class="btn btn-danger btn-sm" (click)="remove(d)">Supprimer</button>
                        }
                      </td>
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
export class DeliverersList {
  private readonly api = inject(DeliverersApi);
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);

  protected readonly canManage = () => this.auth.hasRole('ADMIN', 'MANAGER');
  protected readonly statuses = keysOf(DELIVERER_STATUS);
  protected readonly editableStatuses = this.statuses.filter((s) => s !== 'EN_LIVRAISON');
  protected readonly statusLabels = DELIVERER_STATUS;
  protected readonly vehicle = VEHICLE;
  protected readonly zones = toSignal(inject(ZonesApi).list(), { initialValue: [] });

  protected readonly searchControl = new FormControl('', { nonNullable: true });
  private readonly q = toSignal(
    this.searchControl.valueChanges.pipe(debounceTime(300), distinctUntilChanged()),
    { initialValue: '' },
  );
  protected readonly status = signal<DelivererStatus | ''>('');
  protected readonly zoneId = signal<number | null>(null);
  protected readonly page = linkedSignal({
    source: () => ({ q: this.q(), status: this.status(), zoneId: this.zoneId() }),
    computation: () => 0,
  });

  protected readonly list = rxResource({
    params: () => ({ q: this.q(), status: this.status(), zoneId: this.zoneId(), page: this.page() }),
    stream: ({ params }) => this.api.search({ ...params, size: 10 }),
  });

  protected pick<T extends string>(event: Event): T {
    return (event.target as HTMLSelectElement).value as T;
  }

  protected pickNumber(event: Event): number | null {
    const value = (event.target as HTMLSelectElement).value;
    return value ? Number(value) : null;
  }

  protected changeStatus(deliverer: Deliverer, status: DelivererStatus): void {
    this.api.updateStatus(deliverer.id, status).subscribe({
      next: () => {
        this.toast.success(`${deliverer.fullName} : statut mis à jour.`);
        this.list.reload();
      },
      error: (err: unknown) => {
        this.toast.error(errorMessage(err));
        this.list.reload();
      },
    });
  }

  protected remove(deliverer: Deliverer): void {
    if (!confirm(`Supprimer ${deliverer.fullName} ?`)) {
      return;
    }
    this.api.delete(deliverer.id).subscribe({
      next: () => {
        this.toast.success('Livreur supprimé.');
        this.list.reload();
      },
      error: (err: unknown) => this.toast.error(errorMessage(err)),
    });
  }
}
