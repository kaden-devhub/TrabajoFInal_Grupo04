import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { Administrador } from '../model/administrador';

@Injectable({ providedIn: 'root' })
export class AdministradorService {
  private readonly http = inject(HttpClient);
  private readonly url = environment.apiUrl;

  list(): Observable<Administrador[]> {
    return this.http.get<Administrador[]>(`${this.url}/administradores`);
  }

  insert(value: Administrador): Observable<Administrador> {
    return this.http.post<Administrador>(`${this.url}/administrador`, value);
  }

  update(value: Administrador): Observable<Administrador> {
    return this.http.put<Administrador>(`${this.url}/administrador`, value);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/administrador/${id}`);
  }
}
