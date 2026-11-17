import { HttpErrorResponse } from '@angular/common/http';
import { ApiError } from './models';

/** Message lisible à partir d'une erreur HTTP renvoyée par l'API. */
export function errorMessage(err: unknown): string {
  if (err instanceof HttpErrorResponse) {
    if (err.status === 0) {
      return 'Le serveur est injoignable. Vérifiez votre connexion.';
    }
    const body = err.error as Partial<ApiError> | null;
    if (body?.fieldErrors && Object.keys(body.fieldErrors).length > 0) {
      return Object.entries(body.fieldErrors).map(([field, msg]) => `${field} : ${msg}`).join(' · ');
    }
    if (body?.message) {
      return body.message;
    }
  }
  return 'Une erreur est survenue. Réessayez.';
}
