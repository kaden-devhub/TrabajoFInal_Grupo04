import { inject, Injectable, Service, signal } from '@angular/core';
import { Rol, Sesion } from '../model/sesion';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../environments/enviroment';


const SESSION_KEY = 'comparasalud.sesion';

const RUTA_LOGIN: Record<Rol, string> = {
  CLIENTE: 'clientes',
  FARMACIA: 'farmacias',
  ADMINISTRADOR: 'administradores',
};

// Primera pantalla de cada rol después de iniciar sesión
const INICIO: Record<Rol, string> = {
  CLIENTE: '/cliente/buscar',
  FARMACIA: '/farmacia/ofertas',
  ADMINISTRADOR: '/admin/resumen',
};

// Lee el claim "exp" del JWT. Si el token no es un JWT legible, no se asume vencido:
// en ese caso decide el backend (responderá 401 y el interceptor cierra la sesión).
function tokenVencido(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    return typeof payload.exp === 'number' && payload.exp * 1000 <= Date.now();
  } catch {
    return false;
  }
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private sesionState = signal<Sesion | null>(this.leerSesion());
  sesion = this.sesionState.asReadonly();

  login(rol: Rol, correo: string, contrasena: string): Observable<Sesion> {
    return this.http
      .post<Sesion>(`${environment.apiUrl}/${RUTA_LOGIN[rol]}/login`, {
        correo: correo.trim(),
        contrasena,
      })
      .pipe(tap((sesion) => this.iniciarSesion(sesion)));
  }

  // El backend no tiene endpoint de logout: se borra el token del navegador
  logout(): void {
    sessionStorage.removeItem(SESSION_KEY);
    this.sesionState.set(null);
  }

  // Actualiza el nombre guardado en la sesión (por ejemplo después de editar "Mi cuenta")
  actualizarNombre(nombre: string): void {
    const sesion = this.sesionState();
    if (!sesion) return;
    const nueva = { ...sesion, nombre };
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(nueva));
    this.sesionState.set(nueva);
  }

  // true solo si hay sesión y el token no venció. Si venció, cierra la sesión.
  haySesionValida(): boolean {
    const sesion = this.sesionState();
    if (!sesion) return false;
    if (tokenVencido(sesion.token)) {
      this.logout();
      return false;
    }
    return true;
  }

  hasRole(roles: Rol[]): boolean {
    const sesion = this.sesionState();
    return !!sesion && roles.includes(sesion.rol);
  }

  inicio(rol: Rol): string {
    return INICIO[rol];
  }

  private iniciarSesion(sesion: Sesion): void {
    if (!sesion?.token || !(sesion.rol in INICIO)) {
      throw new Error('El servidor devolvió una respuesta de inicio de sesión incompleta.');
    }
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(sesion));
    this.sesionState.set(sesion);
  }

  private leerSesion(): Sesion | null {
    try {
      const sesion = JSON.parse(sessionStorage.getItem(SESSION_KEY) || 'null') as Sesion | null;
      // Si el token guardado ya venció, se descarta
      return sesion?.token && sesion.rol in INICIO && !tokenVencido(sesion.token) ? sesion : null;
    } catch {
      return null;
    }
  }
}
