import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { Proveedor } from '../model/proveedor';

@Injectable({ providedIn: 'root' })
export class ProveedorService {
  private readonly http = inject(HttpClient);
  private readonly url = environment.apiUrl;

  list(): Observable<Proveedor[]> {
    return this.http.get<Proveedor[]>(`${this.url}/proveedores`);
  }

  insert(value: Proveedor): Observable<Proveedor> {
    return this.http.post<Proveedor>(`${this.url}/proveedor`, value);
  }

  update(value: Proveedor): Observable<Proveedor> {
    return this.http.put<Proveedor>(`${this.url}/proveedor`, value);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/proveedor/${id}`);
  }
}
