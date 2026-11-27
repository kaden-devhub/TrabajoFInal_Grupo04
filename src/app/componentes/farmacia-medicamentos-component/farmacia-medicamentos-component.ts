import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MedicamentoService } from '../../services/medicamento-service';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MedicamentoBusqueda } from '../../model/medicamento';
import { mensajeError } from '../../utils/utilidades';
import { MedicamentoFormDialogComponent } from '../medicamento-form-dialog-component/medicamento-form-dialog-component';
import { OfertaDialogComponent } from '../oferta-dialog-component/oferta-dialog-component';
import { MatIcon } from '@angular/material/icon';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatFormField, MatInput, MatLabel } from '@angular/material/input';
import { MatCard, MatCardContent } from '@angular/material/card';
import { MatTooltip } from '@angular/material/tooltip';

@Component({
  imports: [
    MatIcon,
    MatButton,
    ReactiveFormsModule,
    MatFormField,
    MatLabel,
    MatInput,
    MatCard,
    MatCardContent,
    MatIconButton,
    MatTooltip,
  ],
  selector: 'app-farmacia-medicamentos-component',
  styleUrl: './farmacia-medicamentos-component.css',
  templateUrl: './farmacia-medicamentos-component.html',
})
export class FarmaciaMedicamentosComponent {
  fb: FormBuilder = inject(FormBuilder);
  medicamentoService: MedicamentoService = inject(MedicamentoService);
  dialog: MatDialog = inject(MatDialog);
  router: Router = inject(Router);
  snack: MatSnackBar = inject(MatSnackBar);

  form = this.fb.nonNullable.group({ nombre: [''] });
  resultados = signal<MedicamentoBusqueda[] | null>(null); // null = todavía no buscó

  // GET /api/medicamentos/buscar?nombre=
  buscar() {
    const nombre = this.form.getRawValue().nombre.trim();
    if (!nombre) {
      this.avisar('Escribe el nombre de un medicamento');
      return;
    }
    this.medicamentoService.buscar(nombre).subscribe({
      next: (lista) => this.resultados.set(lista),
      error: (e) => {
        this.resultados.set([]);
        this.avisar(mensajeError(e));
      },
    });
  }

  registrar() {
    this.abrirFormulario();
  }

  editar(m: MedicamentoBusqueda) {
    this.abrirFormulario(m.id);
  }

  private abrirFormulario(id?: number) {
    this.dialog
      .open(MedicamentoFormDialogComponent, { width: '600px', data: { id } })
      .afterClosed()
      .subscribe((m) => {
        if (!m) return;
        // Muestra el medicamento recién guardado
        this.form.setValue({ nombre: m.nombre });
        this.buscar();
      });
  }

  // Abre el diálogo de nueva oferta y, al publicar, lleva a "Mis ofertas"
  crearOferta(m: MedicamentoBusqueda) {
    this.dialog
      .open(OfertaDialogComponent, {
        width: '440px',
        data: { modo: 'crear', idMedicamento: m.id, nombre: m.nombre },
      })
      .afterClosed()
      .subscribe((ok) => ok && this.router.navigate(['/farmacia/ofertas']));
  }

  private avisar(mensaje: string) {
    this.snack.open(mensaje, 'OK', { duration: 3000 });
  }
}
