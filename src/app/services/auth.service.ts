import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../environments/environment';

export type AppRole = 'ROLE_CLIENTE' | 'ROLE_PROVEEDOR' | 'ROLE_ADMIN';

interface AuthResponse {
  jwt: string;
  roles: string[];
}

interface AuthSession {
  token: string;
  username: string;
  roles: AppRole[];
}

const SESSION_KEY = 'comparasalud.auth';
const REMEMBERED_USERNAME_KEY = 'comparasalud.remembered-username';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly sessionState = signal<AuthSession | null>(this.readSession());
  readonly session = this.sessionState.asReadonly();

  login(username: string, password: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/authenticate`, { username, password })
      .pipe(tap((response) => this.startSession(response, username)));
  }

  register(username: string, password: string, role: 'CLIENTE' | 'PROVEEDOR'): Observable<string> {
    return this.http.post(`${environment.apiUrl}/register`, { username, password, rol: role }, { responseType: 'text' });
  }

  logout(): void {
    sessionStorage.removeItem(SESSION_KEY);
    this.sessionState.set(null);
  }

  rememberedUsername(): string {
    try {
      return localStorage.getItem(REMEMBERED_USERNAME_KEY) ?? '';
    } catch {
      return '';
    }
  }

  rememberUsername(username: string, remember: boolean): void {
    try {
      if (remember) localStorage.setItem(REMEMBERED_USERNAME_KEY, username);
      else localStorage.removeItem(REMEMBERED_USERNAME_KEY);
    } catch {
      throw new Error('No se pudo guardar la preferencia de recordar el correo en este navegador.');
    }
  }

  hasRole(roles: AppRole[]): boolean {
    return roles.some((role) => this.sessionState()?.roles.includes(role));
  }

  private startSession(response: AuthResponse, username: string): void {
    if (!response.jwt || !Array.isArray(response.roles) || response.roles.length === 0) {
      throw new Error('El backend devolvió una respuesta de autenticación incompleta.');
    }

    const session: AuthSession = {
      token: response.jwt,
      username,
      roles: response.roles.filter((role): role is AppRole =>
        ['ROLE_CLIENTE', 'ROLE_PROVEEDOR', 'ROLE_ADMIN'].includes(role),
      ),
    };

    if (session.roles.length === 0) {
      throw new Error('El backend devolvió un rol no reconocido.');
    }

    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    this.sessionState.set(session);
  }

  private readSession(): AuthSession | null {
    try {
      const session = JSON.parse(sessionStorage.getItem(SESSION_KEY) || 'null') as AuthSession | null;
      return session?.token && Array.isArray(session.roles) ? session : null;
    } catch {
      return null;
    }
  }
}
