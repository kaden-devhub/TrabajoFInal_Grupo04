import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { Medicamento } from '../model/medicamento';

@Injectable({ providedIn: 'root' })
export class MedicamentoService {
  private readonly http = inject(HttpClient);
  private readonly url = environment.apiUrl;

  list(): Observable<Medicamento[]> {
    return this.http.get<Medicamento[]>(`${this.url}/medicamentos`);
  }

  insert(value: Medicamento): Observable<Medicamento> {
    return this.http.post<Medicamento>(`${this.url}/medicamento`, value);
  }

  update(value: Medicamento): Observable<Medicamento> {
    return this.http.put<Medicamento>(`${this.url}/medicamento`, value);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/medicamento/${id}`);
  }
}
