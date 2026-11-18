import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { Tiposervicio } from '../model/tiposervicio';

@Injectable({ providedIn: 'root' })
export class TiposervicioService {
  private readonly http = inject(HttpClient);
  private readonly url = environment.apiUrl;

  list(): Observable<Tiposervicio[]> {
    return this.http.get<Tiposervicio[]>(`${this.url}/tipos-servicios`);
  }

  insert(value: Tiposervicio): Observable<Tiposervicio> {
    return this.http.post<Tiposervicio>(`${this.url}/tipo-servicio`, value);
  }

  update(value: Tiposervicio): Observable<Tiposervicio> {
    return this.http.put<Tiposervicio>(`${this.url}/tipo-servicio`, value);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/tipo-servicio/${id}`);
  }
}
