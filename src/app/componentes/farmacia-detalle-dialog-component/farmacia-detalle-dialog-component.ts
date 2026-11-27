import { Component, inject, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogTitle } from '@angular/material/dialog';
import { FarmaciaService } from '../../services/farmacia-service';
import { AuthService } from '../../services/auth.service';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ESTRELLAS, mensajeError } from '../../utils/utilidades';
import { FarmaciaPublica } from '../../model/farmacia';
import { CalificacionesFarmacia, Ubicacion } from '../../model/calificacion';
import { forkJoin } from 'rxjs';
import { MatIcon } from '@angular/material/icon';
import { MatAnchor, MatButton, MatIconButton } from '@angular/material/button';
import { DatePipe } from '@angular/common';
import { MatFormField, MatInput, MatLabel } from '@angular/material/input';

@Component({
  imports: [
    MatDialogTitle,
    MatDialogContent,
    MatIcon,
    MatButton,
    DatePipe,
    ReactiveFormsModule,
    MatIconButton,
    MatFormField,
    MatLabel,
    MatInput,
    MatDialogActions,
    MatDialogClose,
    MatAnchor
  ],
  selector: 'app-farmacia-detalle-dialog-component',
  styleUrl: './farmacia-detalle-dialog-component.css',
  templateUrl: './farmacia-detalle-dialog-component.html',
})
export class FarmaciaDetalleDialogComponent {
  data = inject<{ id: number }>(MAT_DIALOG_DATA);
  farmaciaService: FarmaciaService = inject(FarmaciaService);
  auth: AuthService = inject(AuthService);
  fb: FormBuilder = inject(FormBuilder);
  snack: MatSnackBar = inject(MatSnackBar);

  estrellas = ESTRELLAS;
  farmacia = signal<FarmaciaPublica | null>(null);
  ubicacion = signal<Ubicacion | null>(null);
  calificaciones = signal<CalificacionesFarmacia | null>(null);
  puntuacion = signal(5);
  enviando = signal(false);
  error = signal('');

  form = this.fb.nonNullable.group({ comentario: [''] });

  constructor() {
    forkJoin({
      farmacia: this.farmaciaService.getById(this.data.id),
      ubicacion: this.farmaciaService.ubicacion(this.data.id),
      calificaciones: this.farmaciaService.calificaciones(this.data.id),
    }).subscribe({
      next: (r) => {
        this.farmacia.set(r.farmacia);
        this.ubicacion.set(r.ubicacion);
        this.calificaciones.set(r.calificaciones);
      },
      error: (e) => this.error.set(mensajeError(e)),
    });
  }

  // Enlace a Google Maps con la dirección de la farmacia
  urlMapa(u: Ubicacion): string {
    return (
      'https://www.google.com/maps/search/?api=1&query=' +
      encodeURIComponent(`${u.direccion}, ${u.distrito}`)
    );
  }

  elegirPuntuacion(n: number) {
    this.puntuacion.set(n);
  }

  // POST /api/farmacias/{id}/calificaciones y recarga la lista
  enviar() {
    this.enviando.set(true);
    this.farmaciaService
      .calificar(this.data.id, {
        puntuacion: this.puntuacion(),
        comentario: this.form.getRawValue().comentario.trim(),
        idCliente: this.auth.sesion()?.idCliente,
      })
      .subscribe({
        next: () => {
          this.enviando.set(false);
          this.form.reset();
          this.snack.open('Gracias por tu calificación', 'OK', { duration: 3000 });
          this.farmaciaService
            .calificaciones(this.data.id)
            .subscribe((c) => this.calificaciones.set(c));
        },
        error: (e) => {
          this.enviando.set(false);
          this.snack.open(mensajeError(e), 'OK', { duration: 4000 });
        },
      });
  }
}
