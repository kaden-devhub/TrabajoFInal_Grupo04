import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { Servicio } from '../model/servicio';

@Injectable({ providedIn: 'root' })
export class ServicioService {
  private readonly http = inject(HttpClient);
  private readonly url = environment.apiUrl;

  list(): Observable<Servicio[]> {
    return this.http.get<Servicio[]>(`${this.url}/servicios`);
  }

  filterByMedicine(medicine: string): Observable<Servicio[]> {
    return this.http.get<Servicio[]>(`${this.url}/servicios/buscar/${encodeURIComponent(medicine)}`);
  }

  listByCenter(centerId: number): Observable<Servicio[]> {
    return this.http.get<Servicio[]>(`${this.url}/servicios/centro/${centerId}`);
  }

  insert(value: Servicio): Observable<Servicio> {
    return this.http.post<Servicio>(`${this.url}/servicio`, value);
  }

  update(value: Servicio): Observable<Servicio> {
    return this.http.put<Servicio>(`${this.url}/servicio`, value);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/servicio/${id}`);
  }
}
