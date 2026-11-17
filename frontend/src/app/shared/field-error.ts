import { Component, input } from '@angular/core';
import { AbstractControl } from '@angular/forms';

/** Affiche le premier message d'erreur d'un contrôle une fois celui-ci touché. */
@Component({
  selector: 'app-field-error',
  template: `@if (message(); as text) { <span class="error-text" role="alert">{{ text }}</span> }`,
})
export class FieldError {
  readonly control = input.required<AbstractControl>();

  protected message(): string | null {
    const c = this.control();
    if (!c.invalid || !(c.touched || c.dirty) || !c.errors) {
      return null;
    }
    const e = c.errors;
    if (e['required']) return 'Ce champ est obligatoire.';
    if (e['email']) return 'Adresse e-mail invalide.';
    if (e['min']) return `La valeur doit être supérieure ou égale à ${(e['min'] as { min: number }).min}.`;
    if (e['max']) return `La valeur doit être inférieure ou égale à ${(e['max'] as { max: number }).max}.`;
    if (e['minlength']) return `Minimum ${(e['minlength'] as { requiredLength: number }).requiredLength} caractères.`;
    if (e['maxlength']) return `Maximum ${(e['maxlength'] as { requiredLength: number }).requiredLength} caractères.`;
    return 'Valeur invalide.';
  }
}
