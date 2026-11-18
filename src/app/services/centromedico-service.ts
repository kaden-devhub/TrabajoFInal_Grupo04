import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { Centromedico } from '../model/centromedico';

@Injectable({ providedIn: 'root' })
export class CentromedicoService {
  private readonly http = inject(HttpClient);
  private readonly url = environment.apiUrl;

  list(): Observable<Centromedico[]> {
    return this.http.get<Centromedico[]>(`${this.url}/centros-medicos`);
  }

  insert(value: Centromedico): Observable<Centromedico> {
    return this.http.post<Centromedico>(`${this.url}/centro-medico`, value);
  }

  update(value: Centromedico): Observable<Centromedico> {
    return this.http.put<Centromedico>(`${this.url}/centro-medico`, value);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/centro-medico/${id}`);
  }
}
