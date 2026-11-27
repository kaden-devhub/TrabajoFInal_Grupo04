import { Component, inject, signal } from '@angular/core';
import { Categoria } from '../../model/categoria';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { CategoriaService } from '../../services/categoria-service';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { mensajeError } from '../../utils/utilidades';
import { MatIcon } from '@angular/material/icon';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatFormField, MatInput, MatLabel } from '@angular/material/input';

@Component({
  imports: [
    MatIcon,
    MatDialogTitle,
    MatIconButton,
    MatDialogClose,
    MatDialogContent,
    MatLabel,
    MatFormField,
    ReactiveFormsModule,
    MatDialogActions,
    MatInput,
    MatButton,
  ],
  selector: 'app-categoria-form-dialog-component',
  styleUrl: './categoria-form-dialog-component.css',
  templateUrl: './categoria-form-dialog-component.html',
})
export class CategoriaFormDialogComponent {
  data = inject<Partial<Categoria>>(MAT_DIALOG_DATA);
  ref = inject<MatDialogRef<CategoriaFormDialogComponent, boolean>>(MatDialogRef);
  fb: FormBuilder = inject(FormBuilder);
  categoriaService: CategoriaService = inject(CategoriaService);
  snack: MatSnackBar = inject(MatSnackBar);

  esEdicion = !!this.data.id;
  guardando = signal(false);

  form = this.fb.nonNullable.group({
    nombre: [this.data.nombre ?? ''],
    descripcion: [this.data.descripcion ?? ''],
  });

  guardar() {
    const datos = this.form.getRawValue();
    this.guardando.set(true);
    const peticion = this.data.id
      ? this.categoriaService.editar(this.data.id, datos)
      : this.categoriaService.crear(datos);

    peticion.subscribe({
      next: () => {
        this.snack.open(this.esEdicion ? 'Categoría actualizada' : 'Categoría registrada', 'OK', {
          duration: 3000,
        });
        this.ref.close(true);
      },
      error: (e) => {
        this.guardando.set(false);
        this.snack.open(mensajeError(e), 'OK', { duration: 4000 });
      },
    });
  }
}
