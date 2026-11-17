import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { Role } from './models';

export const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  return inject(AuthService).isAuthenticated() ? true : router.createUrlTree(['/login']);
};

/** Restreint une route aux rôles listés dans `data: { roles: [...] }`. */
export const roleGuard: CanActivateFn = (route) => {
  const router = inject(Router);
  const roles = route.data['roles'] as Role[] | undefined;
  return !roles || inject(AuthService).hasRole(...roles) ? true : router.createUrlTree(['/dashboard']);
};
