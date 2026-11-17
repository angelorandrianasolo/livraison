import { ChangeDetectionStrategy, Component, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { filter, switchMap } from 'rxjs';
import { CustomersApi } from '../../core/api/customers.api';
import { errorMessage } from '../../core/errors';
import { ToastService } from '../../core/toast.service';
import { FieldError } from '../../shared/field-error';

@Component({
  selector: 'app-customer-form',
  imports: [ReactiveFormsModule, RouterLink, FieldError],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page">
      <header class="page-head">
        <h1>{{ id() ? 'Modifier le client' : 'Nouveau client' }}</h1>
        <a class="btn btn-ghost" routerLink="/customers">Annuler</a>
      </header>
      <form class="card" [formGroup]="form" (ngSubmit)="submit()">
        <div class="form-grid">
          <div class="field">
            <label for="name">Nom</label>
            <input id="name" class="input" formControlName="name" />
            <app-field-error [control]="form.controls.name" />
          </div>
          <div class="field">
            <label for="email">E-mail</label>
            <input id="email" class="input" type="email" formControlName="email" />
            <app-field-error [control]="form.controls.email" />
          </div>
          <div class="field">
            <label for="phone">Téléphone</label>
            <input id="phone" class="input" formControlName="phone" />
            <app-field-error [control]="form.controls.phone" />
          </div>
          <div class="field">
            <label for="address">Adresse</label>
            <input id="address" class="input" formControlName="address" />
            <app-field-error [control]="form.controls.address" />
          </div>
        </div>
        <button class="btn btn-signal" type="submit" [disabled]="saving()">{{ saving() ? 'Enregistrement…' : 'Enregistrer' }}</button>
      </form>
    </div>
  `,
})
export class CustomerForm {
  readonly id = input<string>();

  private readonly api = inject(CustomersApi);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);
  protected readonly saving = signal(false);

  protected readonly form = inject(NonNullableFormBuilder).group({
    name: ['', [Validators.required, Validators.maxLength(120)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(160)]],
    phone: ['', [Validators.required, Validators.maxLength(30)]],
    address: ['', [Validators.required, Validators.maxLength(255)]],
  });

  constructor() {
    toObservable(this.id)
      .pipe(
        filter((id): id is string => !!id),
        switchMap((id) => this.api.get(Number(id))),
        takeUntilDestroyed(),
      )
      .subscribe((customer) => this.form.patchValue(customer));
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const body = this.form.getRawValue();
    const id = this.id();
    this.saving.set(true);
    (id ? this.api.update(Number(id), body) : this.api.create(body)).subscribe({
      next: () => {
        this.toast.success('Client enregistré.');
        void this.router.navigate(['/customers']);
      },
      error: (err: unknown) => {
        this.saving.set(false);
        this.toast.error(errorMessage(err));
      },
    });
  }
}
