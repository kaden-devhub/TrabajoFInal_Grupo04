import { inject, Injectable, Service } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../environments/enviroments';
import { DatosFarmacia, Farmacia, FarmaciaPublica, PerfilComercial } from '../model/farmacia';
import { Observable } from 'rxjs';
import { CalificacionesFarmacia, NuevaCalificacion, Ubicacion } from '../model/calificacion';

@Injectable({ providedIn: 'root' })
export class FarmaciaService {
  private http = inject(HttpClient);
  private url = environment.apiUrl;

  //Registrar una Farmacia
  insert(farmacia: Farmacia): Observable<Farmacia> {
    return this.http.post<Farmacia>(this.url, farmacia);
  }

  // Listar farmacias por filtros
  listar(
    filtros: { nombre?: string; distrito?: string; estado?: string } = {},
  ): Observable<FarmaciaPublica[]> {
    let params = new HttpParams();
    if (filtros.nombre) params = params.set('nombre', filtros.nombre);
    if (filtros.distrito) params = params.set('distrito', filtros.distrito);
    if (filtros.estado) params = params.set('estado', filtros.estado);
    return this.http.get<FarmaciaPublica[]>(this.url, { params });
  }

  // Buscar una farmacia especifica
  getbyId(id: number): Observable<FarmaciaPublica> {
    return this.http.get<FarmaciaPublica>(`${this.url}/${id}`);
  }

  // Buscar farmacias por ubicación
  ubicacion(id: number): Observable<Ubicacion> {
    return this.http.get<Ubicacion>(`${this.url}/${id}/ubicacion`);
  }

  // Buscar calificaciones por farmacia
  calificaciones(id: number): Observable<CalificacionesFarmacia> {
    return this.http.get<CalificacionesFarmacia>(`${this.url}/${id}/calificaciones`);
  }

  // Calificar una farmacia
  calificar(id: number, calificacion: NuevaCalificacion): Observable<unknown> {
    return this.http.post(`${this.url}/${id}/calificaciones`, calificacion);
  }

  // Actualizar los datos de una farmacia
  editar(id: number, datos: DatosFarmacia): Observable<FarmaciaPublica> {
    return this.http.put<FarmaciaPublica>(`${this.url}/${id}`, datos);
  }

  // Actualizar el perfil comercial de una farmacia
  perfilComercial(id: number, perfil: PerfilComercial): Observable<FarmaciaPublica> {
    return this.http.put<FarmaciaPublica>(`${this.url}/${id}/perfil-comercial`, perfil);
  }
}
