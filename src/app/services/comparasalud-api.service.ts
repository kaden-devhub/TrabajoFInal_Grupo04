import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { forkJoin, Observable } from 'rxjs';
import { environment } from '../environments/environment';

export type ApiEntity = Record<string, unknown>;

@Injectable({ providedIn: 'root' })
export class ComparaSaludApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  getCatalogs(): Observable<{
    doctors: ApiEntity[];
    services: ApiEntity[];
    centers: ApiEntity[];
    medicines: ApiEntity[];
  }> {
    return forkJoin({
      doctors: this.http.get<ApiEntity[]>(`${this.baseUrl}/medicos`),
      services: this.http.get<ApiEntity[]>(`${this.baseUrl}/servicios`),
      centers: this.http.get<ApiEntity[]>(`${this.baseUrl}/centros-medicos`),
      medicines: this.http.get<ApiEntity[]>(`${this.baseUrl}/medicamentos`),
    });
  }

  list(path: string): Observable<ApiEntity[]> {
    return this.http.get<ApiEntity[]>(`${this.baseUrl}/${path}`);
  }

  create(path: string, value: ApiEntity): Observable<ApiEntity> {
    return this.http.post<ApiEntity>(`${this.baseUrl}/${path}`, value);
  }

  update(path: string, value: ApiEntity): Observable<ApiEntity> {
    return this.http.put<ApiEntity>(`${this.baseUrl}/${path}`, value);
  }

  remove(path: string, id: string | number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${path}/${encodeURIComponent(id)}`);
  }

  removeClient(id: string | number): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/cliente/${encodeURIComponent(id)}`, null);
  }
}
