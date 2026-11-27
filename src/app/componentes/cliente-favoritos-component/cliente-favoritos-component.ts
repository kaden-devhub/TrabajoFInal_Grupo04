import { Component, inject, signal } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { FavoritoService } from '../../services/favorito-service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FarmaciaFavorita, MedicamentoFavorito } from '../../model/favorito';
import { mensajeError } from '../../utils/utilidades';
import { MatIcon } from '@angular/material/icon';
import { MatCard, MatCardContent } from '@angular/material/card';
import { CurrencyPipe } from '@angular/common';
import { MatButton, MatIconButton } from '@angular/material/button';
import { RouterLink } from '@angular/router';

@Component({
  imports: [MatIcon, MatCard, MatCardContent, CurrencyPipe, MatIconButton, MatButton, RouterLink],
  selector: 'app-cliente-favoritos-component',
  styleUrl: './cliente-favoritos-component.css',
  templateUrl: './cliente-favoritos-component.html',
})
export class ClienteFavoritosComponent {
  auth: AuthService = inject(AuthService);
  favoritoService: FavoritoService = inject(FavoritoService);
  snack: MatSnackBar = inject(MatSnackBar);

  medicamentos = signal<MedicamentoFavorito[]>([]);
  farmacias = signal<FarmaciaFavorita[]>([]);

  private get idCliente(): number {
    return this.auth.sesion()?.idCliente ?? 0;
  }

  ngOnInit() {
    this.cargar();
  }

  cargar() {
    this.favoritoService.medicamentos(this.idCliente).subscribe({
      next: (lista) => this.medicamentos.set(lista),
      error: (e) => this.avisar(mensajeError(e)),
    });
    this.favoritoService.farmacias(this.idCliente).subscribe({
      next: (lista) => this.farmacias.set(lista),
      error: (e) => this.avisar(mensajeError(e)),
    });
  }

  // DELETE /api/clientes/{id}/medicamentos-favoritos/{idMedicamento}
  quitarMedicamento(id: number) {
    this.favoritoService.quitarMedicamento(this.idCliente, id).subscribe({
      next: () => {
        this.avisar('Quitado de favoritos');
        this.cargar();
      },
      error: (e) => this.avisar(mensajeError(e)),
    });
  }

  // DELETE /api/clientes/{id}/farmacias-favoritas/{idFarmacia}
  quitarFarmacia(id: number) {
    this.favoritoService.quitarFarmacia(this.idCliente, id).subscribe({
      next: () => {
        this.avisar('Farmacia quitada de favoritos');
        this.cargar();
      },
      error: (e) => this.avisar(mensajeError(e)),
    });
  }

  private avisar(mensaje: string) {
    this.snack.open(mensaje, 'OK', { duration: 3000 });
  }
}
