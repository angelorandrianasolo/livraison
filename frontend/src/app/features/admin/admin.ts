import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { PricingApi } from '../../core/api/pricing.api';
import { ZonesApi } from '../../core/api/zones.api';
import { errorMessage } from '../../core/errors';
import { Zone } from '../../core/models';
import { ToastService } from '../../core/toast.service';
import { FieldError } from '../../shared/field-error';

@Component({
  selector: 'app-admin',
  imports: [ReactiveFormsModule, FieldError],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page">
      <header class="page-head">
        <div>
          <h1>Administration</h1>
          <p>Grille tarifaire et zones d'activité.</p>
        </div>
      </header>

      <div class="grid grid-2">
        <form class="card" [formGroup]="pricingForm" (ngSubmit)="savePricing()">
          <h2>Grille tarifaire</h2>
          <p class="muted">prix = (base + km + kg + m³) × priorité × (1 + majoration de zone)</p>
          <div class="form-grid">
            <div class="field"><label for="baseFee">Frais de base (€)</label><input id="baseFee" class="input" type="number" step="0.01" formControlName="baseFee" /><app-field-error [control]="pricingForm.controls.baseFee" /></div>
            <div class="field"><label for="perKm">Prix par km (€)</label><input id="perKm" class="input" type="number" step="0.01" formControlName="pricePerKm" /><app-field-error [control]="pricingForm.controls.pricePerKm" /></div>
            <div class="field"><label for="perKg">Prix par kg (€)</label><input id="perKg" class="input" type="number" step="0.01" formControlName="pricePerKg" /><app-field-error [control]="pricingForm.controls.pricePerKg" /></div>
            <div class="field"><label for="perM3">Prix par m³ (€)</label><input id="perM3" class="input" type="number" step="0.01" formControlName="pricePerM3" /><app-field-error [control]="pricingForm.controls.pricePerM3" /></div>
            <div class="field"><label for="urgent">Coefficient « urgente »</label><input id="urgent" class="input" type="number" step="0.05" formControlName="urgentMultiplier" /><app-field-error [control]="pricingForm.controls.urgentMultiplier" /></div>
            <div class="field"><label for="express">Coefficient « express »</label><input id="express" class="input" type="number" step="0.05" formControlName="expressMultiplier" /><app-field-error [control]="pricingForm.controls.expressMultiplier" /></div>
          </div>
          <button class="btn btn-signal" type="submit">Enregistrer la grille</button>
        </form>

        <section class="card">
          <h2>Zones</h2>
          <table>
            <thead><tr><th>Code</th><th>Nom</th><th class="right">Majoration</th><th></th></tr></thead>
            <tbody>
              @for (z of zones.value() ?? []; track z.id) {
                <tr>
                  <td class="mono">{{ z.code }}</td>
                  <td>{{ z.name }}</td>
                  <td class="mono right">+{{ z.surchargeRate * 100 }} %</td>
                  <td class="actions">
                    <button type="button" class="btn btn-ghost btn-sm" (click)="edit(z)">Modifier</button>
                    <button type="button" class="btn btn-danger btn-sm" (click)="remove(z)">Supprimer</button>
                  </td>
                </tr>
              }
            </tbody>
          </table>

          <form [formGroup]="zoneForm" (ngSubmit)="saveZone()" style="margin-top:1.25rem">
            <h2>{{ editingId() ? 'Modifier la zone' : 'Nouvelle zone' }}</h2>
            <div class="form-grid">
              <div class="field"><label for="code">Code</label><input id="code" class="input" formControlName="code" /><app-field-error [control]="zoneForm.controls.code" /></div>
              <div class="field"><label for="zname">Nom</label><input id="zname" class="input" formControlName="name" /><app-field-error [control]="zoneForm.controls.name" /></div>
              <div class="field"><label for="rate">Majoration (0,10 = +10 %)</label><input id="rate" class="input" type="number" step="0.01" formControlName="surchargeRate" /><app-field-error [control]="zoneForm.controls.surchargeRate" /></div>
            </div>
            <div class="row">
              <button class="btn" type="submit">{{ editingId() ? 'Mettre à jour' : 'Ajouter la zone' }}</button>
              @if (editingId()) { <button type="button" class="btn btn-ghost" (click)="reset()">Annuler</button> }
            </div>
          </form>
        </section>
      </div>
    </div>
  `,
})
export class Admin {
  private readonly pricingApi = inject(PricingApi);
  private readonly zonesApi = inject(ZonesApi);
  private readonly toast = inject(ToastService);
  private readonly fb = inject(NonNullableFormBuilder);

  protected readonly zones = rxResource({ stream: () => this.zonesApi.list() });
  protected readonly editingId = signal<number | null>(null);

  protected readonly pricingForm = this.fb.group({
    baseFee: [0, [Validators.required, Validators.min(0)]],
    pricePerKm: [0, [Validators.required, Validators.min(0)]],
    pricePerKg: [0, [Validators.required, Validators.min(0)]],
    pricePerM3: [0, [Validators.required, Validators.min(0)]],
    urgentMultiplier: [1, [Validators.required, Validators.min(1), Validators.max(10)]],
    expressMultiplier: [1, [Validators.required, Validators.min(1), Validators.max(10)]],
  });
  protected readonly zoneForm = this.fb.group({
    code: ['', [Validators.required, Validators.maxLength(20)]],
    name: ['', [Validators.required, Validators.maxLength(80)]],
    surchargeRate: [0, [Validators.required, Validators.min(0), Validators.max(5)]],
  });

  constructor() {
    this.pricingApi.config().subscribe((config) => this.pricingForm.patchValue(config));
  }

  protected savePricing(): void {
    if (this.pricingForm.invalid) {
      this.pricingForm.markAllAsTouched();
      return;
    }
    this.pricingApi.updateConfig(this.pricingForm.getRawValue()).subscribe({
      next: () => this.toast.success('Grille tarifaire enregistrée.'),
      error: (err: unknown) => this.toast.error(errorMessage(err)),
    });
  }

  protected edit(zone: Zone): void {
    this.editingId.set(zone.id);
    this.zoneForm.patchValue(zone);
  }

  protected reset(): void {
    this.editingId.set(null);
    this.zoneForm.reset();
  }

  protected saveZone(): void {
    if (this.zoneForm.invalid) {
      this.zoneForm.markAllAsTouched();
      return;
    }
    const body = this.zoneForm.getRawValue();
    const id = this.editingId();
    (id ? this.zonesApi.update(id, body) : this.zonesApi.create(body)).subscribe({
      next: () => {
        this.toast.success('Zone enregistrée.');
        this.reset();
        this.zones.reload();
      },
      error: (err: unknown) => this.toast.error(errorMessage(err)),
    });
  }

  protected remove(zone: Zone): void {
    if (!confirm(`Supprimer la zone « ${zone.name} » ?`)) {
      return;
    }
    this.zonesApi.delete(zone.id).subscribe({
      next: () => {
        this.toast.success('Zone supprimée.');
        this.zones.reload();
      },
      error: (err: unknown) => this.toast.error(errorMessage(err)),
    });
  }
}
