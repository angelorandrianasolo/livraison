import { CurrencyPipe, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { FormControl, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Observable, finalize } from 'rxjs';
import { DeliverersApi } from '../../core/api/deliverers.api';
import { IncidentsApi } from '../../core/api/incidents.api';
import { OrdersApi } from '../../core/api/orders.api';
import { AuthService } from '../../core/auth.service';
import { errorMessage } from '../../core/errors';
import { INCIDENT_TYPE, ORDER_STATUS, VEHICLE, keysOf } from '../../core/labels';
import { IncidentType, Order } from '../../core/models';
import { ToastService } from '../../core/toast.service';
import { FieldError } from '../../shared/field-error';
import { RouteStepper } from '../../shared/route-stepper';
import { StatusBadge } from '../../shared/status-badge';

type Panel = 'candidates' | 'deliver' | 'incident' | 'cancel' | null;

@Component({
  selector: 'app-order-detail',
  imports: [RouterLink, ReactiveFormsModule, DatePipe, CurrencyPipe, StatusBadge, RouteStepper, FieldError],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page">
      @if (order.error()) {
        <p class="alert">Cette commande est introuvable. <a routerLink="/orders">Retour à la liste</a></p>
      } @else if (order.value(); as o) {
        <header class="page-head">
          <div>
            <h1>{{ o.orderNumber }}</h1>
            <p class="row">
              <app-badge kind="order" [value]="o.status" />
              <app-badge kind="priority" [value]="o.priority" />
              <span>{{ o.customer.name }}</span>
            </p>
          </div>
          <div class="row">
            <a class="btn btn-ghost" routerLink="/orders">Retour</a>
            @if (isStaff() && o.status === 'CREEE') {
              <a class="btn btn-ghost" [routerLink]="['/orders', o.id, 'edit']">Modifier</a>
            }
          </div>
        </header>

        <section class="card"><app-route-stepper [status]="o.status" /></section>

        <div class="grid grid-2" style="margin-top:1rem">
          <section class="card">
            <h2>Colis</h2>
            <dl>
              <dt>Enlèvement</dt><dd>{{ o.pickupAddress }}</dd>
              <dt>Livraison</dt><dd>{{ o.deliveryAddress }}</dd>
              <dt>Zone</dt><dd>{{ o.zone.name }}</dd>
              <dt>Poids · volume</dt><dd class="mono">{{ o.weightKg }} kg · {{ o.volumeM3 }} m³</dd>
              <dt>Distance</dt><dd class="mono">{{ o.distanceKm }} km</dd>
              <dt>Date prévue</dt><dd>{{ o.plannedDate | date: 'dd/MM/yyyy' }}</dd>
              <dt>Prix</dt><dd class="mono"><strong>{{ o.price | currency: 'EUR' }}</strong></dd>
            </dl>
          </section>

          <section class="card">
            <h2>Livreur et preuve de livraison</h2>
            @if (o.deliverer; as d) {
              <p><strong>{{ d.fullName }}</strong><br /><span class="muted">{{ d.phone }}</span></p>
            } @else {
              <p class="muted">Aucun livreur assigné.</p>
            }
            @if (o.proof; as p) {
              <dl>
                <dt>Remise le</dt><dd>{{ p.deliveredAt | date: 'dd/MM/yyyy HH:mm' }}</dd>
                <dt>Réceptionnaire</dt><dd>{{ p.receiverName }}</dd>
                <dt>Code de confirmation</dt><dd class="mono">{{ p.confirmationCode }}</dd>
                @if (p.comment) { <dt>Commentaire</dt><dd>{{ p.comment }}</dd> }
              </dl>
            }
          </section>
        </div>

        @if (isStaff() && !terminal(o)) {
          <section class="card">
            <h2>Actions</h2>
            <div class="row">
              @if (can(o, 'ASSIGNEE')) {
                <button type="button" class="btn btn-signal" [disabled]="busy()" (click)="run(api.assign(o.id), 'Livreur attribué automatiquement.')">Attribution automatique</button>
                <button type="button" class="btn btn-ghost" (click)="toggle('candidates')">Choisir un livreur</button>
              }
              @if (can(o, 'PRISE_EN_CHARGE')) {
                <button type="button" class="btn" [disabled]="busy()" (click)="run(api.pickup(o.id), 'Colis pris en charge.')">Confirmer la prise en charge</button>
              }
              @if (can(o, 'EN_TRANSIT')) {
                <button type="button" class="btn" [disabled]="busy()" (click)="run(api.start(o.id), 'Livraison démarrée.')">Démarrer la livraison</button>
              }
              @if (can(o, 'LIVREE')) {
                <button type="button" class="btn btn-signal" (click)="toggle('deliver')">Clôturer la livraison</button>
              }
              @if (can(o, 'ECHEC_LIVRAISON') && o.status !== 'ECHEC_LIVRAISON') {
                <button type="button" class="btn btn-ghost" (click)="toggle('incident')">Signaler un incident</button>
              }
              @if (can(o, 'RETOURNEE')) {
                <button type="button" class="btn btn-ghost" [disabled]="busy()" (click)="run(api.markReturned(o.id), 'Colis marqué comme retourné.')">Marquer comme retourné</button>
              }
              @if (canManage() && can(o, 'ANNULEE')) {
                <button type="button" class="btn btn-danger" (click)="toggle('cancel')">Annuler la commande</button>
              }
            </div>

            @switch (panel()) {
              @case ('candidates') {
                <div class="panel">
                  <h2>Livreurs éligibles (du meilleur au moins bon score)</h2>
                  @if (candidates.value(); as list) {
                    @if (list.length === 0) {
                      <p class="empty">Aucun livreur éligible : zone, capacité ou disponibilité incompatibles.</p>
                    } @else {
                      <table>
                        <thead><tr><th>Livreur</th><th>Véhicule</th><th>Distance</th><th>En cours</th><th>Score</th><th></th></tr></thead>
                        <tbody>
                          @for (c of list; track c.deliverer.id) {
                            <tr>
                              <td>{{ c.deliverer.fullName }}</td>
                              <td>{{ vehicle[c.deliverer.vehicleType] }}</td>
                              <td class="mono">{{ c.distanceKm === null ? '—' : c.distanceKm + ' km' }}</td>
                              <td class="mono">{{ c.activeDeliveries }}/{{ c.deliverer.maxActiveDeliveries }}</td>
                              <td class="mono"><strong>{{ c.score }}</strong></td>
                              <td class="actions"><button type="button" class="btn btn-sm" [disabled]="busy()" (click)="run(api.assign(o.id, c.deliverer.id), 'Livreur assigné.')">Assigner</button></td>
                            </tr>
                          }
                        </tbody>
                      </table>
                    }
                  } @else { <p class="skeleton">Calcul des scores…</p> }
                </div>
              }
              @case ('deliver') {
                <form class="panel" [formGroup]="deliverForm" (ngSubmit)="deliver(o)">
                  <h2>Preuve de livraison</h2>
                  <div class="form-grid">
                    <div class="field">
                      <label for="receiver">Nom du réceptionnaire</label>
                      <input id="receiver" class="input" formControlName="receiverName" />
                      <app-field-error [control]="deliverForm.controls.receiverName" />
                    </div>
                    <div class="field">
                      <label for="code">Code de confirmation</label>
                      <input id="code" class="input" formControlName="confirmationCode" />
                      <app-field-error [control]="deliverForm.controls.confirmationCode" />
                    </div>
                  </div>
                  <div class="field">
                    <label for="comment">Commentaire (optionnel)</label>
                    <textarea id="comment" class="input" rows="2" formControlName="comment"></textarea>
                  </div>
                  <button class="btn btn-signal" type="submit" [disabled]="busy()">Confirmer la remise</button>
                </form>
              }
              @case ('incident') {
                <form class="panel" [formGroup]="incidentForm" (ngSubmit)="reportIncident(o)">
                  <h2>Signaler un incident</h2>
                  <div class="field">
                    <label for="incType">Type</label>
                    <select id="incType" class="input" formControlName="type">
                      @for (t of incidentTypes; track t) { <option [value]="t">{{ incidentLabels[t] }}</option> }
                    </select>
                  </div>
                  <div class="field">
                    <label for="incDesc">Description</label>
                    <textarea id="incDesc" class="input" rows="2" formControlName="description"></textarea>
                    <app-field-error [control]="incidentForm.controls.description" />
                  </div>
                  <button class="btn btn-danger" type="submit" [disabled]="busy()">Enregistrer l'incident</button>
                </form>
              }
              @case ('cancel') {
                <div class="panel">
                  <h2>Annuler la commande</h2>
                  <div class="field">
                    <label for="reason">Motif (optionnel)</label>
                    <input id="reason" class="input" [formControl]="cancelReason" />
                  </div>
                  <button type="button" class="btn btn-danger" [disabled]="busy()" (click)="run(api.cancel(o.id, cancelReason.value), 'Commande annulée.')">Confirmer l'annulation</button>
                </div>
              }
            }
          </section>
        }

        <div class="grid grid-2" style="margin-top:1rem">
          <section class="card">
            <h2>Suivi</h2>
            <ol class="timeline">
              @for (e of tracking.value() ?? []; track e.id) {
                <li>
                  <app-badge kind="order" [value]="e.status" />
                  <span>{{ e.note }}</span>
                  <small class="muted">{{ e.occurredAt | date: 'dd/MM/yyyy HH:mm' }} · {{ e.actor }}</small>
                </li>
              }
            </ol>
          </section>
          <section class="card">
            <h2>Incidents</h2>
            @for (i of incidents.value() ?? []; track i.id) {
              <p>
                <strong>{{ incidentLabels[i.type] }}</strong>
                <span class="badge" [class]="i.resolved ? 'tone-ok' : 'tone-danger'" style="margin-left:.5rem">{{ i.resolved ? 'Résolu' : 'Ouvert' }}</span><br />
                {{ i.description }}<br />
                <small class="muted">{{ i.occurredAt | date: 'dd/MM/yyyy HH:mm' }}@if (i.resolution) { · Résolution : {{ i.resolution }} }</small>
              </p>
            } @empty {
              <p class="muted">Aucun incident signalé.</p>
            }
          </section>
        </div>
      } @else {
        <p class="skeleton">Chargement…</p>
      }
    </div>
  `,
  styles: `
    dl { display: grid; grid-template-columns: max-content 1fr; gap: .35rem 1.25rem; margin: 0; }
    dt { color: var(--steel); }
    dd { margin: 0; }
    .panel { margin-top: 1.1rem; padding-top: 1.1rem; border-top: 1px dashed var(--line); }
    .timeline { list-style: none; margin: 0; padding: 0 0 0 1rem; border-left: 3px solid var(--signal); display: flex; flex-direction: column; gap: .9rem; }
    .timeline li { display: flex; flex-direction: column; gap: .15rem; align-items: flex-start; }
  `,
})
export class OrderDetail {
  /** Paramètre de route :id (withComponentInputBinding). */
  readonly id = input.required<string>();

  protected readonly api = inject(OrdersApi);
  private readonly deliverersApi = inject(DeliverersApi);
  private readonly incidentsApi = inject(IncidentsApi);
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);
  private readonly fb = inject(NonNullableFormBuilder);

  private readonly orderId = computed(() => Number(this.id()));
  protected readonly panel = signal<Panel>(null);
  protected readonly busy = signal(false);

  protected readonly isStaff = computed(() => this.auth.hasRole('ADMIN', 'MANAGER', 'OPERATOR'));
  protected readonly canManage = computed(() => this.auth.hasRole('ADMIN', 'MANAGER'));

  protected readonly order = rxResource({ params: () => this.orderId(), stream: ({ params }) => this.api.get(params) });
  protected readonly tracking = rxResource({ params: () => this.orderId(), stream: ({ params }) => this.api.tracking(params) });
  protected readonly incidents = rxResource({ params: () => this.orderId(), stream: ({ params }) => this.incidentsApi.byOrder(params) });
  /** Chargés uniquement lorsque le panneau de choix manuel est ouvert. */
  protected readonly candidates = rxResource({
    params: () => (this.panel() === 'candidates' ? this.orderId() : undefined),
    stream: ({ params }) => this.deliverersApi.available(params),
  });

  protected readonly vehicle = VEHICLE;
  protected readonly incidentTypes = keysOf(INCIDENT_TYPE);
  protected readonly incidentLabels = INCIDENT_TYPE;
  protected readonly statusLabels = ORDER_STATUS;

  protected readonly deliverForm = this.fb.group({
    receiverName: ['', [Validators.required, Validators.maxLength(120)]],
    confirmationCode: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(20)]],
    comment: [''],
  });
  protected readonly incidentForm = this.fb.group({
    type: this.fb.control<IncidentType>('CLIENT_ABSENT'),
    description: ['', [Validators.required, Validators.maxLength(1000)]],
  });
  protected readonly cancelReason = new FormControl('', { nonNullable: true });

  protected can(order: Order, target: Order['status']): boolean {
    return order.allowedTransitions.includes(target);
  }

  protected terminal(order: Order): boolean {
    return order.allowedTransitions.length === 0;
  }

  protected toggle(panel: Exclude<Panel, null>): void {
    this.panel.update((current) => (current === panel ? null : panel));
  }

  protected deliver(order: Order): void {
    if (this.deliverForm.invalid) {
      this.deliverForm.markAllAsTouched();
      return;
    }
    const { receiverName, confirmationCode, comment } = this.deliverForm.getRawValue();
    this.run(this.api.deliver(order.id, { receiverName, confirmationCode, comment: comment || undefined }),
      'Livraison clôturée.');
  }

  protected reportIncident(order: Order): void {
    if (this.incidentForm.invalid) {
      this.incidentForm.markAllAsTouched();
      return;
    }
    this.busy.set(true);
    this.incidentsApi.report(order.id, this.incidentForm.getRawValue())
      .pipe(finalize(() => this.busy.set(false)))
      .subscribe({
        next: () => {
          this.toast.success('Incident enregistré.');
          this.incidentForm.reset();
          this.refresh();
        },
        error: (err: unknown) => this.toast.error(errorMessage(err)),
      });
  }

  /** Exécute une action métier puis recharge la commande, son suivi et ses incidents. */
  protected run(action: Observable<Order>, successMessage: string): void {
    this.busy.set(true);
    action.pipe(finalize(() => this.busy.set(false))).subscribe({
      next: () => {
        this.toast.success(successMessage);
        this.refresh();
      },
      error: (err: unknown) => this.toast.error(errorMessage(err)),
    });
  }

  private refresh(): void {
    this.panel.set(null);
    this.order.reload();
    this.tracking.reload();
    this.incidents.reload();
  }
}
