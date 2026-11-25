import { inject, Injectable, Service } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/enviroments';
import { Observable } from 'rxjs';
import { FarmaciaFavorita, MedicamentoFavorito } from '../model/favorito';

@Injectable({ providedIn: 'root' })
export class FavoritoService {
  private http = inject(HttpClient);
  private url = environment.apiUrl;

  // Buscar medicamentos favoritos del cliente
  medicamentos(idCliente: number): Observable<MedicamentoFavorito[]> {
    return this.http.get<MedicamentoFavorito[]>(`${this.url}/${idCliente}/medicamentos-favoritos`);
  }

  // Asignar medicamento favorito a un cliente especifico

  agregarMedicamento(idCliente: number, idMedicamento: number): Observable<unknown> {
    return this.http.post(`${this.url}/${idCliente}/medicamentos-favoritos`, { idMedicamento });
  }

  // Eliminar medicamento de la lista de favoritos

  quitarMedicamento(idCliente: number, idMedicamento: number): Observable<void> {
    return this.http.delete<void>(
      `${this.url}/${idCliente}/medicamentos-favoritos/${idMedicamento}`,
    );
  }

  // Buscar farmacias favoritos del cliente

  farmacias(idCliente: number): Observable<FarmaciaFavorita[]> {
    return this.http.get<FarmaciaFavorita[]>(`${this.url}/${idCliente}/farmacias-favoritas`);
  }

  // Asignar farmacia favorita a un cliente especifico

  agregarFarmacia(idCliente: number, idMedicamento: number): Observable<unknown> {
    return this.http.post(`${this.url}/${idCliente}/medicamentos-favoritos`, { idMedicamento });
  }

  // Eliminar farmacia de la lista de favoritos

  quitarFarmacia(idCliente: number, idFarmacia: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${idCliente}/farmacias-favoritas/${idFarmacia}`);
  }
}
