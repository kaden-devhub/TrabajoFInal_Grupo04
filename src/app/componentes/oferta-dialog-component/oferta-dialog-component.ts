import { Component, inject, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { OfertaService } from '../../services/oferta-service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { mensajeError } from '../../utils/utilidades';
import { CambioOferta } from '../../model/oferta';

export interface OfertaDialogData {
  modo: 'crear' | 'editar';
  nombre: string; // nombre del medicamento
  idMedicamento?: number; // solo al crear
  id?: number; // solo al editar
  precio?: number;
  stock?: number;
}
@Component({
  imports: [],
  selector: 'app-oferta-dialog-component',
  styleUrl: './oferta-dialog-component.css',
  templateUrl: './oferta-dialog-component.html',
})
export class OfertaDialogComponent {
  data = inject<OfertaDialogData>(MAT_DIALOG_DATA);
  ref = inject<MatDialogRef<OfertaDialogComponent, boolean>>(MatDialogRef);
  fb: FormBuilder = inject(FormBuilder);
  auth: AuthService = inject(AuthService);
  ofertaService: OfertaService = inject(OfertaService);
  snack: MatSnackBar = inject(MatSnackBar);

  esNueva = this.data.modo === 'crear';
  guardando = signal(false);

  form = this.fb.group({
    precio: [this.data.precio ?? (null as number | null)],
    stock: [this.data.stock ?? (null as number | null)],
  });

  guardar() {
    const { precio, stock } = this.form.getRawValue();
    const hayPrecio = precio !== null && precio !== undefined && `${precio}` !== '';
    const hayStock = stock !== null && stock !== undefined && `${stock}` !== '';

    if (this.esNueva) {
      if (!hayPrecio || !hayStock || Number(precio) <= 0 || Number(stock) <= 0) {
        this.avisar('Indica un precio y un stock mayores que 0');
        return;
      }
    } else if (!hayPrecio && !hayStock) {
      this.avisar('Indica el precio o el stock');
      return;
    }

    this.guardando.set(true);
    const idFarmacia = this.auth.sesion()?.idFarmacia ?? 0;
    const cambio: CambioOferta = {};
    if (hayPrecio) cambio.precio = Number(precio);
    if (hayStock) cambio.stock = Number(stock);

    // Crear: POST. Editar con ambos campos: PUT completo. Editar solo uno: PUT precio-stock.
    const peticion = this.esNueva
      ? this.ofertaService.crear({
          idMedicamento: this.data.idMedicamento ?? 0,
          idFarmacia,
          precio: Number(precio),
          stock: Number(stock),
        })
      : hayPrecio && hayStock
        ? this.ofertaService.editar(this.data.id ?? 0, cambio)
        : this.ofertaService.editarPrecioStock(this.data.id ?? 0, cambio);

    peticion.subscribe({
      next: () => {
        this.snack.open(this.esNueva ? 'Oferta publicada' : 'Oferta actualizada', 'OK', {
          duration: 3000,
        });
        this.ref.close(true);
      },
      error: (e) => {
        this.guardando.set(false);
        this.avisar(mensajeError(e));
      },
    });
  }

  private avisar(mensaje: string) {
    this.snack.open(mensaje, 'OK', { duration: 4000 });
  }
}
