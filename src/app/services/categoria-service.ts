import { inject, Injectable, Service } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Categoria, CategoriaForm } from '../model/categoria';
import { environment } from '../environments/enviroment';

@Injectable({ providedIn: 'root' })
export class CategoriaService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/categorias`;

  //GET /api/categorias
  listar(): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(`${environment.apiUrl}/categorias`);
  }
  // POST /api/categorias
  crear(datos: CategoriaForm): Observable<Categoria> {
    return this.http.post<Categoria>(this.url, datos);
  }

  // PUT /api/categorias/{id}
  editar(id: number, datos: CategoriaForm): Observable<Categoria> {
    return this.http.put<Categoria>(`${this.url}/${id}`, datos);
  }

  // DELETE /api/categorias/{id}
  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
