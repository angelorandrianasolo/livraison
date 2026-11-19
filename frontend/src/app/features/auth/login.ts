import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../../core/auth.service';
import { errorMessage } from '../../core/errors';
import { Session } from '../../core/models';
import { FieldError } from '../../shared/field-error';
import { PasswordField } from '../../shared/password-field';

type Mode = 'login' | 'register';

function passwordsMatch(group: AbstractControl): ValidationErrors | null {
  return group.get('password')?.value === group.get('confirm')?.value ? null : { mismatch: true };
}

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, FieldError, PasswordField],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="wrap">
      <div class="card panel">
        <h1>Relais</h1>
        <p class="muted subtitle">Console de régulation des livraisons</p>

        <div class="tabs" role="tablist" aria-label="Accès">
          <button type="button" role="tab" [attr.aria-selected]="mode() === 'login'" [class.active]="mode() === 'login'" (click)="switchMode('login')">Se connecter</button>
          <button type="button" role="tab" [attr.aria-selected]="mode() === 'register'" [class.active]="mode() === 'register'" (click)="switchMode('register')">S'inscrire</button>
        </div>

        @if (mode() === 'login') {
          <form [formGroup]="loginForm" (ngSubmit)="submitLogin()">
            <div class="field">
              <label for="login-username">Identifiant</label>
              <input id="login-username" class="input" formControlName="username" autocomplete="username" />
              <app-field-error [control]="loginForm.controls.username" />
            </div>
            <app-password-field inputId="login-password" [control]="loginForm.controls.password" />

            @if (error(); as message) { <p class="alert" role="alert">{{ message }}</p> }
            <button class="btn btn-signal submit" type="submit" [disabled]="loading()">
              {{ loading() ? 'Connexion…' : 'Se connecter' }}
            </button>
          </form>
        } @else {
          <form [formGroup]="registerForm" (ngSubmit)="submitRegister()">
            <div class="field">
              <label for="reg-fullname">Nom complet</label>
              <input id="reg-fullname" class="input" formControlName="fullName" autocomplete="name" />
              <app-field-error [control]="registerForm.controls.fullName" />
            </div>
            <div class="field">
              <label for="reg-username">Identifiant</label>
              <input id="reg-username" class="input" formControlName="username" autocomplete="username" />
              <app-field-error [control]="registerForm.controls.username" />
            </div>
            <app-password-field inputId="reg-password" autocomplete="new-password" [control]="registerForm.controls.password" />
            <app-password-field inputId="reg-confirm" label="Confirmer le mot de passe" autocomplete="new-password" [control]="registerForm.controls.confirm" />
            @if (registerForm.hasError('mismatch') && registerForm.controls.confirm.touched && registerForm.controls.confirm.value) {
              <p class="error-text" role="alert">Les deux mots de passe ne correspondent pas.</p>
            }
            <p class="muted hint">Le compte créé a un accès en consultation (lecture seule).</p>

            @if (error(); as message) { <p class="alert" role="alert">{{ message }}</p> }
            <button class="btn btn-signal submit" type="submit" [disabled]="loading()">
              {{ loading() ? 'Création…' : 'Créer mon compte' }}
            </button>
          </form>
        }
      </div>
    </div>
  `,
  styles: `
    .wrap { min-height: 100vh; display: grid; place-items: center; padding: 1rem; background: var(--ink); }
    .panel { width: min(400px, 100%); padding: 2rem; }
    h1 { font-size: 1.8rem; }
    .subtitle { margin: .2rem 0 1.25rem; }
    .tabs { display: grid; grid-template-columns: 1fr 1fr; border-bottom: 2px solid var(--line); margin-bottom: 1.25rem; }
    .tabs button { background: none; border: 0; border-bottom: 3px solid transparent; margin-bottom: -2px; padding: .6rem; font: inherit; font-weight: 600; color: var(--steel); cursor: pointer; }
    .tabs button.active { color: var(--ink); border-bottom-color: var(--signal); }
    .alert { margin: 0 0 1rem; }
    .hint { margin: 0 0 1rem; font-size: .85rem; }
    .submit { width: 100%; justify-content: center; }
  `,
})
export class Login {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder).nonNullable;

  protected readonly mode = signal<Mode>('login');
  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly loginForm = this.fb.group({
    username: ['', Validators.required],
    password: ['', Validators.required],
  });

  protected readonly registerForm = this.fb.group(
    {
      fullName: ['', [Validators.required, Validators.maxLength(120)]],
      username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(60), Validators.pattern(/^[a-zA-Z0-9._-]+$/)]],
      password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(100)]],
      confirm: ['', Validators.required],
    },
    { validators: passwordsMatch },
  );

  protected switchMode(mode: Mode): void {
    this.mode.set(mode);
    this.error.set(null);
  }

  protected submitLogin(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }
    const { username, password } = this.loginForm.getRawValue();
    this.run(this.auth.login(username, password));
  }

  protected submitRegister(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }
    const { fullName, username, password } = this.registerForm.getRawValue();
    this.run(this.auth.register({ fullName, username, password }));
  }

  private run(request$: Observable<Session>): void {
    this.loading.set(true);
    this.error.set(null);
    request$.subscribe({
      next: () => void this.router.navigate(['/dashboard']),
      error: (err: unknown) => {
        this.loading.set(false);
        this.error.set(errorMessage(err));
      },
    });
  }
}