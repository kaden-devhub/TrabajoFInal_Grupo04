import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { Medico } from '../model/medico';

@Injectable({ providedIn: 'root' })
export class MedicoService {
  private readonly http = inject(HttpClient);
  private readonly url = environment.apiUrl;

  list(): Observable<Medico[]> {
    return this.http.get<Medico[]>(`${this.url}/medicos`);
  }

  filterBySpecialtyAndCenter(specialtyId: number, centerId: number): Observable<Medico[]> {
    return this.http.get<Medico[]>(`${this.url}/medicos/especialidad/${specialtyId}/centro/${centerId}`);
  }

  insert(value: Medico): Observable<Medico> {
    return this.http.post<Medico>(`${this.url}/medico`, value);
  }

  update(value: Medico): Observable<Medico> {
    return this.http.put<Medico>(`${this.url}/medico`, value);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/medico/${id}`);
  }
}
