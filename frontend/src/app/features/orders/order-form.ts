import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { EMPTY, catchError, debounceTime, filter, map, startWith, switchMap } from 'rxjs';
import { CustomersApi } from '../../core/api/customers.api';
import { OrdersApi } from '../../core/api/orders.api';
import { PricingApi } from '../../core/api/pricing.api';
import { ZonesApi } from '../../core/api/zones.api';
import { errorMessage } from '../../core/errors';
import { PRIORITY, keysOf } from '../../core/labels';
import { Priority } from '../../core/models';
import { ToastService } from '../../core/toast.service';
import { FieldError } from '../../shared/field-error';

@Component({
  selector: 'app-order-form',
  imports: [ReactiveFormsModule, RouterLink, CurrencyPipe, FieldError],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page">
      <header class="page-head">
        <h1>{{ id() ? 'Modifier la commande' : 'Nouvelle commande' }}</h1>
        <a class="btn btn-ghost" [routerLink]="id() ? ['/orders', id()] : ['/orders']">Annuler</a>
      </header>

      <form [formGroup]="form" (ngSubmit)="submit()" class="grid grid-2">
        <section class="card">
          <h2>Trajet</h2>
          <div class="field">
            <label for="customerId">Client</label>
            <select id="customerId" class="input" formControlName="customerId">
              <option [ngValue]="null" disabled>Choisir un client</option>
              @for (c of customers(); track c.id) { <option [ngValue]="c.id">{{ c.name }}</option> }
            </select>
            <app-field-error [control]="form.controls.customerId" />
          </div>
          <div class="field">
            <label for="pickup">Adresse d'enlèvement</label>
            <input id="pickup" class="input" formControlName="pickupAddress" />
            <app-field-error [control]="form.controls.pickupAddress" />
          </div>
          <div class="field">
            <label for="delivery">Adresse de livraison</label>
            <input id="delivery" class="input" formControlName="deliveryAddress" />
            <app-field-error [control]="form.controls.deliveryAddress" />
          </div>
          <div class="form-grid">
            <div class="field">
              <label for="lat">Latitude d'enlèvement (optionnel)</label>
              <input id="lat" class="input" type="number" step="any" formControlName="pickupLatitude" />
            </div>
            <div class="field">
              <label for="lon">Longitude d'enlèvement (optionnel)</label>
              <input id="lon" class="input" type="number" step="any" formControlName="pickupLongitude" />
            </div>
          </div>
        </section>

        <section class="card">
          <h2>Colis et tarif</h2>
          <div class="form-grid">
            <div class="field">
              <label for="weight">Poids (kg)</label>
              <input id="weight" class="input" type="number" step="any" formControlName="weightKg" />
              <app-field-error [control]="form.controls.weightKg" />
            </div>
            <div class="field">
              <label for="volume">Volume (m³)</label>
              <input id="volume" class="input" type="number" step="any" formControlName="volumeM3" />
              <app-field-error [control]="form.controls.volumeM3" />
            </div>
            <div class="field">
              <label for="distance">Distance (km)</label>
              <input id="distance" class="input" type="number" step="any" formControlName="distanceKm" />
              <app-field-error [control]="form.controls.distanceKm" />
            </div>
            <div class="field">
              <label for="planned">Date prévue</label>
              <input id="planned" class="input" type="date" formControlName="plannedDate" />
              <app-field-error [control]="form.controls.plannedDate" />
            </div>
            <div class="field">
              <label for="zone">Zone</label>
              <select id="zone" class="input" formControlName="zoneId">
                <option [ngValue]="null" disabled>Choisir une zone</option>
                @for (z of zones(); track z.id) { <option [ngValue]="z.id">{{ z.name }}</option> }
              </select>
              <app-field-error [control]="form.controls.zoneId" />
            </div>
            <div class="field">
              <label for="priority">Priorité</label>
              <select id="priority" class="input" formControlName="priority">
                @for (p of priorities; track p) { <option [ngValue]="p">{{ priorityLabels[p].label }}</option> }
              </select>
            </div>
          </div>

          <div class="estimate" aria-live="polite">
            @if (estimate(); as e) {
              <span class="muted">Prix estimé</span>
              <strong class="total">{{ e.total | currency: 'EUR' }}</strong>
              <small class="muted">
                base {{ e.baseFee | currency: 'EUR' }} + distance {{ e.distanceCost | currency: 'EUR' }}
                + poids {{ e.weightCost | currency: 'EUR' }} + volume {{ e.volumeCost | currency: 'EUR' }}
                × priorité {{ e.priorityMultiplier }} × zone {{ 1 + e.zoneSurchargeRate }}
              </small>
            } @else {
              <span class="muted">Renseignez la zone et le colis pour estimer le prix.</span>
            }
          </div>
        </section>

        <div class="row" style="grid-column: 1 / -1">
          <button class="btn btn-signal" type="submit" [disabled]="saving()">
            {{ saving() ? 'Enregistrement…' : id() ? 'Enregistrer les modifications' : 'Créer la commande' }}
          </button>
        </div>
      </form>
    </div>
  `,
  styles: `
    .estimate { display: flex; flex-direction: column; gap: .15rem; padding: .8rem 1rem; background: var(--bg); border-left: 4px solid var(--signal); border-radius: var(--radius); }
    .total { font-size: 1.6rem; font-variant-numeric: tabular-nums; }
  `,
})
export class OrderForm {
  /** Paramètre de route : présent en modification, absent en création. */
  readonly id = input<string>();

  private readonly fb = inject(NonNullableFormBuilder);
  private readonly ordersApi = inject(OrdersApi);
  private readonly pricingApi = inject(PricingApi);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  protected readonly priorities = keysOf(PRIORITY);
  protected readonly priorityLabels = PRIORITY;
  protected readonly saving = signal(false);

  protected readonly customers = toSignal(
    inject(CustomersApi).search({ size: 100 }).pipe(map((p) => p.content)), { initialValue: [] },
  );
  protected readonly zones = toSignal(inject(ZonesApi).list(), { initialValue: [] });

  protected readonly form = this.fb.group({
    customerId: this.fb.control<number | null>(null, Validators.required),
    pickupAddress: ['', [Validators.required, Validators.maxLength(255)]],
    deliveryAddress: ['', [Validators.required, Validators.maxLength(255)]],
    pickupLatitude: this.fb.control<number | null>(null),
    pickupLongitude: this.fb.control<number | null>(null),
    weightKg: [1, [Validators.required, Validators.min(0.01)]],
    volumeM3: [0.05, [Validators.required, Validators.min(0.001)]],
    priority: this.fb.control<Priority>('NORMALE'),
    distanceKm: [1, [Validators.required, Validators.min(0.1)]],
    zoneId: this.fb.control<number | null>(null, Validators.required),
    plannedDate: [new Date().toISOString().slice(0, 10), Validators.required],
  });

  /** Estimation recalculée (avec anti-rebond) à chaque modification du formulaire. */
  protected readonly estimate = toSignal(
    this.form.valueChanges.pipe(
      startWith(null),
      debounceTime(250),
      map(() => this.form.getRawValue()),
      filter((v) => v.zoneId !== null && v.distanceKm > 0 && v.weightKg > 0 && v.volumeM3 > 0),
      switchMap((v) =>
        this.pricingApi
          .estimate({
            zoneId: v.zoneId as number,
            distanceKm: v.distanceKm,
            weightKg: v.weightKg,
            volumeM3: v.volumeM3,
            priority: v.priority,
          })
          .pipe(catchError(() => EMPTY)),
      ),
    ),
    { initialValue: null },
  );

  constructor() {
    toObservable(this.id)
      .pipe(
        filter((id): id is string => !!id),
        switchMap((id) => this.ordersApi.get(Number(id))),
        takeUntilDestroyed(),
      )
      .subscribe((order) => {
        this.form.patchValue({ ...order, customerId: order.customer.id, zoneId: order.zone.id });
        this.form.controls.customerId.disable();
      });
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { customerId, ...rest } = this.form.getRawValue();
    const body = { ...rest, zoneId: rest.zoneId as number };
    this.saving.set(true);

    const id = this.id();
    const request$ = id
      ? this.ordersApi.update(Number(id), body)
      : this.ordersApi.create({ ...body, customerId: customerId as number });

    request$.subscribe({
      next: (order) => {
        this.toast.success(id ? 'Commande modifiée.' : `Commande ${order.orderNumber} créée.`);
        void this.router.navigate(['/orders', order.id]);
      },
      error: (err: unknown) => {
        this.saving.set(false);
        this.toast.error(errorMessage(err));
      },
    });
  }
}
