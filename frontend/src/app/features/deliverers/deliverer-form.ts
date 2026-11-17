import { ChangeDetectionStrategy, Component, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { filter, switchMap } from 'rxjs';
import { DeliverersApi } from '../../core/api/deliverers.api';
import { ZonesApi } from '../../core/api/zones.api';
import { errorMessage } from '../../core/errors';
import { VEHICLE, keysOf } from '../../core/labels';
import { VehicleType } from '../../core/models';
import { ToastService } from '../../core/toast.service';
import { FieldError } from '../../shared/field-error';

@Component({
  selector: 'app-deliverer-form',
  imports: [ReactiveFormsModule, RouterLink, FieldError],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page">
      <header class="page-head">
        <h1>{{ id() ? 'Modifier le livreur' : 'Nouveau livreur' }}</h1>
        <a class="btn btn-ghost" routerLink="/deliverers">Annuler</a>
      </header>
      <form class="card" [formGroup]="form" (ngSubmit)="submit()">
        <div class="form-grid">
          <div class="field">
            <label for="firstName">Prénom</label>
            <input id="firstName" class="input" formControlName="firstName" />
            <app-field-error [control]="form.controls.firstName" />
          </div>
          <div class="field">
            <label for="lastName">Nom</label>
            <input id="lastName" class="input" formControlName="lastName" />
            <app-field-error [control]="form.controls.lastName" />
          </div>
          <div class="field">
            <label for="phone">Téléphone</label>
            <input id="phone" class="input" formControlName="phone" />
            <app-field-error [control]="form.controls.phone" />
          </div>
          <div class="field">
            <label for="vehicle">Véhicule</label>
            <select id="vehicle" class="input" formControlName="vehicleType">
              @for (v of vehicles; track v) { <option [ngValue]="v">{{ vehicleLabels[v] }}</option> }
            </select>
          </div>
          <div class="field">
            <label for="zone">Zone d'activité</label>
            <select id="zone" class="input" formControlName="zoneId">
              <option [ngValue]="null" disabled>Choisir une zone</option>
              @for (z of zones(); track z.id) { <option [ngValue]="z.id">{{ z.name }}</option> }
            </select>
            <app-field-error [control]="form.controls.zoneId" />
          </div>
          <div class="field">
            <label for="cap">Capacité maximale (kg)</label>
            <input id="cap" class="input" type="number" step="any" formControlName="maxCapacityKg" />
            <app-field-error [control]="form.controls.maxCapacityKg" />
          </div>
          <div class="field">
            <label for="vol">Volume maximal (m³)</label>
            <input id="vol" class="input" type="number" step="any" formControlName="maxVolumeM3" />
            <app-field-error [control]="form.controls.maxVolumeM3" />
          </div>
          <div class="field">
            <label for="max">Livraisons simultanées maximum</label>
            <input id="max" class="input" type="number" formControlName="maxActiveDeliveries" />
            <app-field-error [control]="form.controls.maxActiveDeliveries" />
          </div>
          <div class="field">
            <label for="lat">Latitude actuelle (optionnel)</label>
            <input id="lat" class="input" type="number" step="any" formControlName="lastLatitude" />
          </div>
          <div class="field">
            <label for="lon">Longitude actuelle (optionnel)</label>
            <input id="lon" class="input" type="number" step="any" formControlName="lastLongitude" />
          </div>
        </div>
        <button class="btn btn-signal" type="submit" [disabled]="saving()">{{ saving() ? 'Enregistrement…' : 'Enregistrer' }}</button>
      </form>
    </div>
  `,
})
export class DelivererForm {
  readonly id = input<string>();

  private readonly fb = inject(NonNullableFormBuilder);
  private readonly api = inject(DeliverersApi);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  protected readonly vehicles = keysOf(VEHICLE);
  protected readonly vehicleLabels = VEHICLE;
  protected readonly zones = toSignal(inject(ZonesApi).list(), { initialValue: [] });
  protected readonly saving = signal(false);

  protected readonly form = this.fb.group({
    firstName: ['', [Validators.required, Validators.maxLength(80)]],
    lastName: ['', [Validators.required, Validators.maxLength(80)]],
    phone: ['', [Validators.required, Validators.maxLength(30)]],
    vehicleType: this.fb.control<VehicleType>('MOTO'),
    zoneId: this.fb.control<number | null>(null, Validators.required),
    maxCapacityKg: [20, [Validators.required, Validators.min(0.1)]],
    maxVolumeM3: [0.5, [Validators.required, Validators.min(0.01)]],
    maxActiveDeliveries: [5, [Validators.required, Validators.min(1), Validators.max(20)]],
    lastLatitude: this.fb.control<number | null>(null),
    lastLongitude: this.fb.control<number | null>(null),
  });

  constructor() {
    toObservable(this.id)
      .pipe(
        filter((id): id is string => !!id),
        switchMap((id) => this.api.get(Number(id))),
        takeUntilDestroyed(),
      )
      .subscribe((d) => this.form.patchValue({ ...d, zoneId: d.zone.id }));
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const raw = this.form.getRawValue();
    const body = { ...raw, zoneId: raw.zoneId as number };
    const id = this.id();
    this.saving.set(true);
    (id ? this.api.update(Number(id), body) : this.api.create(body)).subscribe({
      next: () => {
        this.toast.success('Livreur enregistré.');
        void this.router.navigate(['/deliverers']);
      },
      error: (err: unknown) => {
        this.saving.set(false);
        this.toast.error(errorMessage(err));
      },
    });
  }
}
