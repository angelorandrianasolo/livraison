import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { errorMessage } from '../../core/errors';
import { FieldError } from '../../shared/field-error';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, FieldError],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="wrap">
      <form class="card" [formGroup]="form" (ngSubmit)="submit()">
        <h1>Relais</h1>
        <p class="muted">Console de régulation des livraisons</p>

        <div class="field">
          <label for="username">Identifiant</label>
          <input id="username" class="input" formControlName="username" autocomplete="username" />
          <app-field-error [control]="form.controls.username" />
        </div>
        <div class="field">
          <label for="password">Mot de passe</label>
          <input id="password" class="input" type="password" formControlName="password" autocomplete="current-password" />
          <app-field-error [control]="form.controls.password" />
        </div>

        @if (error(); as message) {
          <p class="alert" role="alert">{{ message }}</p>
        }
        <button class="btn btn-signal submit" type="submit" [disabled]="loading()">
          {{ loading() ? 'Connexion…' : 'Se connecter' }}
        </button>
      </form>
    </div>
  `,
  styles: `
    .wrap { min-height: 100vh; display: grid; place-items: center; padding: 1rem; background: var(--ink); }
    form { width: min(380px, 100%); padding: 2rem; }
    h1 { font-size: 1.8rem; }
    p.muted { margin: .2rem 0 1.5rem; }
    .alert { margin: 0 0 1rem; }
    .submit { width: 100%; justify-content: center; }
  `,
})
export class Login {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly form = inject(FormBuilder).nonNullable.group({
    username: ['', Validators.required],
    password: ['', Validators.required],
  });
  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    this.error.set(null);
    const { username, password } = this.form.getRawValue();
    this.auth.login(username, password).subscribe({
      next: () => void this.router.navigate(['/dashboard']),
      error: (err: unknown) => {
        this.loading.set(false);
        this.error.set(errorMessage(err));
      },
    });
  }
}
