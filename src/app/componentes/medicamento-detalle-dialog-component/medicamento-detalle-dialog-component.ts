import { Component, inject, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogTitle } from '@angular/material/dialog';
import { MedicamentoService } from '../../services/medicamento-service';
import { Medicamento, Recomendacion, ReportePrecios } from '../../model/medicamento';
import { forkJoin } from 'rxjs';
import { mensajeError } from '../../utils/utilidades';
import { MatIcon } from '@angular/material/icon';
import { CurrencyPipe } from '@angular/common';
import { MatButton } from '@angular/material/button';

// Detalle (GET /medicamentos/{id}) + reporte de precios + alternativas recomendadas
@Component({
  imports: [
    MatDialogTitle,
    MatDialogContent,
    MatIcon,
    CurrencyPipe,
    MatDialogActions,
    MatButton,
    MatDialogClose,
  ],
  selector: 'app-medicamento-detalle-dialog-component',
  styleUrl: './medicamento-detalle-dialog-component.css',
  templateUrl: './medicamento-detalle-dialog-component.html',
})
export class MedicamentoDetalleDialogComponent {
  data = inject<{ id: number }>(MAT_DIALOG_DATA);
  medicamentoService: MedicamentoService = inject(MedicamentoService);

  medicamento = signal<Medicamento | null>(null);
  recomendaciones = signal<Recomendacion[]>([]);
  reporte = signal<ReportePrecios | null>(null);
  error = signal('');

  constructor() {
    forkJoin({
      medicamento: this.medicamentoService.getById(this.data.id),
      recomendaciones: this.medicamentoService.recomendaciones(this.data.id),
      reporte: this.medicamentoService.reporte(this.data.id),
    }).subscribe({
      next: (r) => {
        this.medicamento.set(r.medicamento);
        this.recomendaciones.set(r.recomendaciones);
        this.reporte.set(r.reporte);
      },
      error: (e) => this.error.set(mensajeError(e)),
    });
  }

  // "Nombre · concentración · presentación", omitiendo los que vienen vacíos
  resumen(m: Medicamento): string {
    return [m.nombre, m.concentracion, m.presentacion].filter((x) => !!x).join(' · ');
  }

  // Datos que se muestran solo si tienen valor
  datos(m: Medicamento): { etiqueta: string; valor?: string }[] {
    return [
      { etiqueta: 'Principio activo', valor: m.principioActivo },
      { etiqueta: 'Laboratorio', valor: m.laboratorio },
      { etiqueta: 'Descripción', valor: m.descripcion },
      { etiqueta: 'Advertencias', valor: m.advertencias },
    ].filter((d) => d.valor);
  }
}
