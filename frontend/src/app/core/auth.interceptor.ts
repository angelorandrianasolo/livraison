import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from './auth.service';
import { ToastService } from './toast.service';

const isLogin = (url: string) => url.endsWith('/api/auth/login');

/** Ajoute le jeton JWT aux appels API. */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = inject(AuthService).token();
  if (token && req.url.startsWith('/api/') && !isLogin(req.url)) {
    req = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  }
  return next(req);
};

/** Déconnecte sur 401 et signale les accès refusés (403). */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const toast = inject(ToastService);
  return next(req).pipe(
    catchError((err: unknown) => {
      if (err instanceof HttpErrorResponse && !isLogin(req.url)) {
        if (err.status === 401) {
          auth.logout();
        } else if (err.status === 403) {
          toast.error("Vous n'avez pas les droits pour effectuer cette action.");
        }
      }
      return throwError(() => err);
    }),
  );
};
