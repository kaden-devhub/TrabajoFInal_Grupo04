import { inject, Injectable, Service } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/enviroment';
import { Cliente, ClientePublico } from '../model/cliente';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ClienteService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/clientes`;

  //Registro del cliente
  insert(cliente: Cliente): Observable<Cliente> {
    return this.http.post<Cliente>(this.url, cliente);
  }

  //Buscar cliente especifico
  getById(id: number): Observable<ClientePublico> {
    return this.http.get<ClientePublico>(`${this.url}/${id}`);
  }

  //Actualizar clientes
  actualizarNombre(
    id: number,
    datos: { nombre: string; apellidos: string },
  ): Observable<ClientePublico> {
    return this.http.put<ClientePublico>(`${this.url}/${id}/nombre`, datos);
  }

  //Eliminar cliente por Id
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
