import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { Especialidad } from '../model/especialidad';

@Injectable({ providedIn: 'root' })
export class EspecialidadService {
  private readonly http = inject(HttpClient);
  private readonly url = environment.apiUrl;

  list(): Observable<Especialidad[]> {
    return this.http.get<Especialidad[]>(`${this.url}/especialidades`);
  }

  insert(value: Especialidad): Observable<Especialidad> {
    return this.http.post<Especialidad>(`${this.url}/especialidad`, value);
  }

  update(value: Especialidad): Observable<Especialidad> {
    return this.http.put<Especialidad>(`${this.url}/especialidad`, value);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/especialidad/${id}`);
  }
}
