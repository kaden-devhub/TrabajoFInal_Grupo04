import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { FarmaciaService } from '../../services/farmacia-service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ESTRELLAS, mensajeError } from '../../utils/utilidades';
import { FarmaciaPublica } from '../../model/farmacia';
import { CalificacionesFarmacia } from '../../model/calificacion';
import { forkJoin } from 'rxjs';

@Component({
  imports: [],
  selector: 'app-farmacia-perfil-component',
  styleUrl: './farmacia-perfil-component.css',
  templateUrl: './farmacia-perfil-component.html',
})
export class FarmaciaPerfilComponent implements OnInit {
  fb: FormBuilder = inject(FormBuilder);
  auth: AuthService = inject(AuthService);
  farmaciaService: FarmaciaService = inject(FarmaciaService);
  snack: MatSnackBar = inject(MatSnackBar);

  estrellas = ESTRELLAS;
  farmacia = signal<FarmaciaPublica | null>(null);
  calificaciones = signal<CalificacionesFarmacia | null>(null);
  guardandoDatos = signal(false);
  guardandoPerfil = signal(false);

  formDatos = this.fb.nonNullable.group({
    nombre: ['', Validators.required],
    licencia: ['', Validators.required],
    direccion: ['', Validators.required],
    distrito: ['', Validators.required],
  });

  formPerfil = this.fb.nonNullable.group({
    telefono: ['', [Validators.required, Validators.pattern(/^\d{7,9}$/)]],
    horario: ['', Validators.required],
  });

  private get idFarmacia(): number {
    return this.auth.sesion()?.idFarmacia ?? 0;
  }

  ngOnInit() {
    this.cargar();
  }

  // GET /api/farmacias/{id} y GET /api/farmacias/{id}/calificaciones
  cargar() {
    forkJoin({
      farmacia: this.farmaciaService.getById(this.idFarmacia),
      calificaciones: this.farmaciaService.calificaciones(this.idFarmacia),
    }).subscribe({
      next: ({ farmacia, calificaciones }) => {
        this.farmacia.set(farmacia);
        this.calificaciones.set(calificaciones);
        this.formDatos.setValue({
          nombre: farmacia.nombre,
          licencia: farmacia.licencia,
          direccion: farmacia.direccion,
          distrito: farmacia.distrito,
        });
        this.formPerfil.setValue({
          telefono: farmacia.telefono ?? '',
          horario: farmacia.horario ?? '',
        });
      },
      error: (e) => this.avisar(mensajeError(e)),
    });
  }

  // PUT /api/farmacias/{id}
  guardarDatos() {
    if (this.formDatos.invalid) {
      this.formDatos.markAllAsTouched();
      this.avisar('Completa todos los datos de la farmacia');
      return;
    }
    this.guardandoDatos.set(true);
    this.farmaciaService.editar(this.idFarmacia, this.formDatos.getRawValue()).subscribe({
      next: (f) => {
        this.guardandoDatos.set(false);
        this.auth.actualizarNombre(f.nombre);
        this.avisar('Datos actualizados');
        this.cargar();
      },
      error: (e) => {
        this.guardandoDatos.set(false);
        this.avisar(mensajeError(e));
      },
    });
  }

  // PUT /api/farmacias/{id}/perfil-comercial
  guardarPerfil() {
    if (this.formPerfil.invalid) {
      this.formPerfil.markAllAsTouched();
      this.avisar('Revisa el teléfono (7 a 9 dígitos) y el horario');
      return;
    }
    this.guardandoPerfil.set(true);
    this.farmaciaService.perfilComercial(this.idFarmacia, this.formPerfil.getRawValue()).subscribe({
      next: () => {
        this.guardandoPerfil.set(false);
        this.avisar('Perfil comercial actualizado');
        this.cargar();
      },
      error: (e) => {
        this.guardandoPerfil.set(false);
        this.avisar(mensajeError(e));
      },
    });
  }

  inicial(nombre: string): string {
    return (nombre.trim()[0] ?? '?').toUpperCase();
  }

  private avisar(mensaje: string) {
    this.snack.open(mensaje, 'OK', { duration: 3000 });
  }
}
