import { inject, Injectable, Service } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../environments/enviroments';
import { Observable } from 'rxjs';
import { CambioOferta, NuevaOferta, Oferta } from '../model/oferta';

@Injectable({ providedIn: 'root' })
export class OfertaService {
  private http = inject(HttpClient);
  private url = environment.apiUrl;

  //Buscar ofertas de medicamentos SOLO CON STOCK

  list(filtros: { farmaciaId?: string | number; distrito?: string } = {}): Observable<Oferta[]> {
    let params = new HttpParams();
    if (filtros.farmaciaId) params = params.set('farmaciaId', filtros.farmaciaId);
    if (filtros.distrito) params = params.set('distrito', filtros.distrito);
    return this.http.get<Oferta[]>(`${environment.apiUrl}/ofertas`, { params });
  }

  //Buscar ofertas por farmacia, incluyendo las agotadas
  listFarm(idFarmacia: number): Observable<Oferta[]> {
    return this.http.get<Oferta[]>(`${environment.apiUrl}/farmacias/${idFarmacia}/ofertas`);
  }

  // Crear una oferta nueva
  insert(oferta: NuevaOferta): Observable<Oferta> {
    return this.http.post<Oferta>(`${environment.apiUrl}/ofertas`, oferta);
  }

  // Actualizar Precio y Stock de las ofertas
  update(id: number, cambio: CambioOferta): Observable<Oferta> {
    return this.http.put<Oferta>(`${environment.apiUrl}/ofertas/${id}`, cambio);
  }

  // Actualizar el precio o el stock de las ofertas
  updatePreciosStock(id: number, cambio: CambioOferta): Observable<Oferta> {
    return this.http.put<Oferta>(`${environment.apiUrl}/ofertas/${id}/precio-stock`, cambio);
  }

  // Eliminar una oferta por Id
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/ofertas/${id}`);
  }
}
