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
  favoriteMed(idCliente: number): Observable<MedicamentoFavorito[]> {
    return this.http.get<MedicamentoFavorito[]>(`${this.url}/${idCliente}/medicamentos-favoritos`);
  }

  // Asignar medicamento favorito a un cliente especifico

  insert(idCliente: number, idMedicamento: number): Observable<unknown> {
    return this.http.post(`${this.url}/${idCliente}/medicamentos-favoritos`, { idMedicamento });
  }

  // Eliminar medicamento de la lista de favoritos

  deleteMedFav(idCliente: number, idMedicamento: number): Observable<void> {
    return this.http.delete<void>(
      `${this.url}/${idCliente}/medicamentos-favoritos/${idMedicamento}`,
    );
  }




}
