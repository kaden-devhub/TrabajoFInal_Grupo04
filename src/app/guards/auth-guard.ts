import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Rol } from '../model/sesion';

/*
  Guard funcional. Se genera así: ng generate guard guards/auth-guard --functional --skip-tests

  Uso en app.routes.ts:
    { path: 'admin/resumen', component: X, canActivate: [authGuard], data: { roles: ['ADMINISTRADOR'] } }

  - Sin sesión (o token vencido)    -> alert "No accesible!" y /login
  - Con sesión pero de otro rol     -> a la pantalla de inicio de su propio rol
  - Si la ruta no declara data.roles, basta con haber iniciado sesión.

  Esto mejora la experiencia de usuario; la seguridad real la hace el backend
  validando el token en cada endpoint.
*/

export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const roles = route.data['roles'] as Rol[] | undefined;

  // haySesionValida() también cierra la sesión si el token ya venció
  if (!auth.haySesionValida()) {
    alert('No accesible!');
    return router.createUrlTree(['/login']);
  }
  const sesion = auth.sesion()!;
  if (roles && !roles.includes(sesion.rol)) {
    return router.createUrlTree([auth.inicio(sesion.rol)]);
  }
  return true;
};
