import { Component, inject, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogTitle } from '@angular/material/dialog';
import { MedicamentoService } from '../../service/medicamento-service';
import { Comparacion } from '../../model/medicamento';
import { mensajeError } from '../../utils/utilidades';
import { MatIcon } from '@angular/material/icon';
import { CurrencyPipe } from '@angular/common';
import { MatButton } from '@angular/material/button';

@Component({
  imports: [
    MatDialogTitle,
    MatIcon,
    MatDialogContent,
    CurrencyPipe,
    MatDialogActions,
    MatButton,
    MatDialogClose,
  ],
  selector: 'app-comparacion-dialog-component',
  styleUrl: './comparacion-dialog-component.css',
  templateUrl: './comparacion-dialog-component.html',
})
export class ComparacionDialogComponent {
  data = inject<{ ids: number[] }>(MAT_DIALOG_DATA);
  medicamentoService: MedicamentoService = inject(MedicamentoService);

  resultado = signal<Comparacion[] | null>(null);
  error = signal('');

  constructor() {
    this.medicamentoService.comparar(this.data.ids).subscribe({
      next: (r) => this.resultado.set(r),
      error: (e) => this.error.set(mensajeError(e)),
    });
  }
}
