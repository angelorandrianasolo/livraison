import { Component, input, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { FieldError } from './field-error';

/** Champ mot de passe avec bouton Afficher / Masquer. */
@Component({
  selector: 'app-password-field',
  imports: [ReactiveFormsModule, FieldError],
  template: `
    <div class="field">
      <label [for]="inputId()">{{ label() }}</label>
      <div class="wrap">
        <input
          [id]="inputId()"
          class="input"
          [type]="visible() ? 'text' : 'password'"
          [formControl]="control()"
          [attr.autocomplete]="autocomplete()"
        />
        <button
          type="button"
          class="toggle"
          [attr.aria-pressed]="visible()"
          [attr.aria-label]="visible() ? 'Masquer le mot de passe' : 'Afficher le mot de passe'"
          (click)="visible.set(!visible())"
        >
          {{ visible() ? 'Masquer' : 'Afficher' }}
        </button>
      </div>
      <app-field-error [control]="control()" />
    </div>
  `,
  styles: `
    .wrap { position: relative; }
    .wrap .input { padding-right: 5.5rem; }
    .toggle { position: absolute; right: .35rem; top: 50%; transform: translateY(-50%); background: none; border: 0; color: var(--info); font: inherit; font-size: .85rem; font-weight: 600; cursor: pointer; padding: .25rem .5rem; border-radius: var(--radius); }
    .toggle:hover { background: var(--bg); }
  `,
})
export class PasswordField {
  readonly control = input.required<FormControl<string>>();
  readonly inputId = input.required<string>();
  readonly label = input('Mot de passe');
  readonly autocomplete = input('current-password');

  protected readonly visible = signal(false);
}