import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { Cliente } from '../model/cliente';

@Injectable({ providedIn: 'root' })
export class ClienteService {
  private readonly http = inject(HttpClient);
  private readonly url = environment.apiUrl;

  list(): Observable<Cliente[]> {
    return this.http.get<Cliente[]>(`${this.url}/clientes`);
  }

  insert(value: Cliente): Observable<Cliente> {
    return this.http.post<Cliente>(`${this.url}/cliente`, value);
  }

  update(value: Cliente): Observable<Cliente> {
    return this.http.request<Cliente>('GET', `${this.url}/cliente`, { body: value });
  }

  delete(id: number): Observable<void> {
    return this.http.put<void>(`${this.url}/cliente/${id}`, null);
  }
}
