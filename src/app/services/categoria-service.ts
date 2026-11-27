import { inject, Injectable, Service } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Categoria } from '../model/categoria';
import { environment } from '../environments/enviroment';

@Injectable({providedIn: 'root'})
export class CategoriaService {
  private http = inject(HttpClient);

//GET /api/categorias
  listar(): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(`${environment.apiUrl}/categorias`);
  }
}
