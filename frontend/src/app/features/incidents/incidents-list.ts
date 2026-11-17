import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, linkedSignal, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { IncidentsApi } from '../../core/api/incidents.api';
import { AuthService } from '../../core/auth.service';
import { errorMessage } from '../../core/errors';
import { INCIDENT_TYPE } from '../../core/labels';
import { ToastService } from '../../core/toast.service';
import { Pager } from '../../shared/pager';

type Filter = 'all' | 'open' | 'resolved';

@Component({
  selector: 'app-incidents-list',
  imports: [RouterLink, DatePipe, ReactiveFormsModule, Pager],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page">
      <header class="page-head">
        <div>
          <h1>Incidents</h1>
          <p>Problèmes signalés par les livreurs en cours de tournée.</p>
        </div>
      </header>
      <div class="filters">
        <select class="input" aria-label="Filtre" (change)="filter.set(pick($event))">
          <option value="all">Tous</option>
          <option value="open">Ouverts</option>
          <option value="resolved">Résolus</option>
        </select>
      </div>
      <div class="card">
        @if (list.error()) {
          <p class="alert">Impossible de charger les incidents.</p>
        } @else if (list.value(); as result) {
          @if (result.content.length === 0) {
            <p class="empty">Aucun incident.</p>
          } @else {
            <div class="table-wrap">
              <table>
                <thead><tr><th>Date</th><th>Type</th><th>Commande</th><th>Livreur</th><th>Description</th><th>État</th><th></th></tr></thead>
                <tbody>
                  @for (i of result.content; track i.id) {
                    <tr>
                      <td class="mono">{{ i.occurredAt | date: 'dd/MM HH:mm' }}</td>
                      <td><strong>{{ labels[i.type] }}</strong></td>
                      <td><a [routerLink]="['/orders', i.orderId]">{{ i.orderNumber }}</a></td>
                      <td>{{ i.delivererName }}</td>
                      <td>{{ i.description }}</td>
                      <td>
                        <span class="badge" [class]="i.resolved ? 'tone-ok' : 'tone-danger'">{{ i.resolved ? 'Résolu' : 'Ouvert' }}</span>
                        @if (i.resolution) { <br /><small class="muted">{{ i.resolution }}</small> }
                      </td>
                      <td class="actions">
                        @if (!i.resolved && canResolve()) {
                          @if (resolvingId() === i.id) {
                            <input class="input" style="width:200px" placeholder="Résolution" aria-label="Résolution" [formControl]="resolution" />
                            <button type="button" class="btn btn-sm" (click)="resolve(i.id)">Valider</button>
                          } @else {
                            <button type="button" class="btn btn-ghost btn-sm" (click)="startResolve(i.id)">Résoudre</button>
                          }
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
export class IncidentsList {
  private readonly api = inject(IncidentsApi);
  private readonly toast = inject(ToastService);
  private readonly auth = inject(AuthService);

  protected readonly labels = INCIDENT_TYPE;
  protected readonly canResolve = () => this.auth.hasRole('ADMIN', 'MANAGER');
  protected readonly filter = signal<Filter>('open');
  protected readonly page = linkedSignal({ source: () => this.filter(), computation: () => 0 });
  protected readonly resolvingId = signal<number | null>(null);
  protected readonly resolution = new FormControl('', { nonNullable: true, validators: Validators.required });

  protected readonly list = rxResource({
    params: () => ({ filter: this.filter(), page: this.page() }),
    stream: ({ params }) =>
      this.api.search({
        resolved: params.filter === 'all' ? null : params.filter === 'resolved',
        page: params.page,
        size: 10,
      }),
  });

  protected pick(event: Event): Filter {
    return (event.target as HTMLSelectElement).value as Filter;
  }

  protected startResolve(id: number): void {
    this.resolution.reset();
    this.resolvingId.set(id);
  }

  protected resolve(id: number): void {
    if (this.resolution.invalid) {
      this.toast.error('Indiquez comment l’incident a été résolu.');
      return;
    }
    this.api.resolve(id, this.resolution.value).subscribe({
      next: () => {
        this.toast.success('Incident résolu.');
        this.resolvingId.set(null);
        this.list.reload();
      },
      error: (err: unknown) => this.toast.error(errorMessage(err)),
    });
  }
}
