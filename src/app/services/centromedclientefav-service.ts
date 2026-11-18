import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { Centromedclientefav } from '../model/centromedclientefav';

@Injectable({ providedIn: 'root' })
export class CentromedclientefavService {
  private readonly http = inject(HttpClient);
  private readonly url = environment.apiUrl;

  list(): Observable<Centromedclientefav[]> {
    return this.http.get<Centromedclientefav[]>(`${this.url}/centrosmedclientesfav`);
  }

  insert(value: Centromedclientefav): Observable<Centromedclientefav> {
    return this.http.post<Centromedclientefav>(`${this.url}/centromedclientefav`, value);
  }
}
