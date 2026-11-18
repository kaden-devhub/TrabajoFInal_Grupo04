import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AppRole, AuthService } from './auth.service';

export const roleGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const requiredRoles = route.data['roles'] as AppRole[] | undefined;

  if (!auth.session()) {
    return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
  }

  if (requiredRoles && !auth.hasRole(requiredRoles)) {
    return router.createUrlTree(['/']);
  }

  return true;
};
