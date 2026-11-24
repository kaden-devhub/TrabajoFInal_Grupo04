import { HttpInterceptorFn, HttpStatusCode } from '@angular/common/http';
import { AuthService } from '../service/auth.service';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '../environments/enviroments';
import { catchError, EMPTY, throwError } from 'rxjs';

/*
  Interceptor que añade "Authorization: Bearer <token>" a las peticiones hacia la API
  y gestiona la sesión vencida de forma centralizada.

  Generado con: ng g interceptor interceptor/auth-interceptor --skip-tests
  Registrado en app.config.ts:
    provideHttpClient(withInterceptors([authInterceptor]))
*/

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  // Solo se toca lo que va hacia NUESTRA API (el token nunca se envía a terceros)
  if (!request.url.startsWith(environment.apiUrl)) {
    return next(request);
  }

  // Un 401 en el login significa "credenciales incorrectas", no "sesión vencida":
  // lo dejamos pasar para que AuthComponent muestre el mensaje.
  const esLogin = request.url.endsWith('/login');
  const token = auth.sesion()?.token;

  const peticion =token && !esLogin
    ? request.clone({ setHeaders: { 'Authorization': `Bearer ${token}` } }):
      request;

  return next(peticion).pipe(
    catchError((error) => {
    if (error.status === HttpStatusCode.Unauthorized && !esLogin) {
      auth.logout();
      router.navigate(['/login']);
      return EMPTY;
    }
    return throwError(() => error);
    })
  );
};
