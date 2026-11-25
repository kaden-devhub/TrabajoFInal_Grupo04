import { inject, Injectable, Service } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/enviroments';
import { Observable } from 'rxjs';
import {
  Comparacion,
  Medicamento,
  MedicamentoBusqueda,
  MedicamentoForm,
  Recomendacion,
  ReportePrecios,
} from '../model/medicamento';

@Injectable({ providedIn: 'root' })
export class MedicamentoService {
  private http = inject(HttpClient);
  private url = environment.apiUrl;

  //Buscar medicamento por nombre

  buscar(nombre: string): Observable<MedicamentoBusqueda[]> {
    return this.http.get<MedicamentoBusqueda[]>(`${this.url}/buscar`, { params: { nombre } });
  }

  //Buscar medicamento por ID

  getById(id: number): Observable<Medicamento> {
    return this.http.get<Medicamento>(`${this.url}/${id}`);
  }

  // Buscar recomendaciones por Medicamentos

  recomendaciones(id: number): Observable<Recomendacion[]> {
    return this.http.get<Recomendacion[]>(`${this.url}/${id}/recomendaciones`);
  }

  // Buscar Reporte de Precios por medicamento

  reporte(id: number): Observable<ReportePrecios> {
    return this.http.get<ReportePrecios>(`${this.url}/${id}/reporte-precios`);
  }

  // Comparar Medicamentos

  comparar(ids: number[]): Observable<Comparacion[]> {
    return this.http.get<Comparacion[]>(`${this.url}/comparacion`, {
      params: { ids: ids.join(',') },
    });
  }

  // Registrar Medicamentos

  registrar(datos: MedicamentoForm): Observable<Medicamento> {
    return this.http.post<Medicamento>(this.url, datos);
  }

  // Editar información de un medicamento

  editar(id: number, datos: MedicamentoForm): Observable<Medicamento> {
    return this.http.put<Medicamento>(`${this.url}/${id}`, datos);
  }
}
