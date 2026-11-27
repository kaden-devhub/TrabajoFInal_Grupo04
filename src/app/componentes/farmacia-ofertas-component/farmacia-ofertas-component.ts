import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { OfertaService } from '../../services/oferta-service';
import { FarmaciaService } from '../../services/farmacia-service';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Oferta } from '../../model/oferta';
import { CalificacionesFarmacia } from '../../model/calificacion';
import { claseStock, mensajeError } from '../../utils/utilidades';
import { OfertaDialogComponent } from '../oferta-dialog-component/oferta-dialog-component';

@Component({
  imports: [],
  selector: 'app-farmacia-ofertas-component',
  styleUrl: './farmacia-ofertas-component.css',
  templateUrl: './farmacia-ofertas-component.html',
})
export class FarmaciaOfertasComponent implements OnInit {
  auth: AuthService = inject(AuthService);
  ofertaService: OfertaService = inject(OfertaService);
  farmaciaService: FarmaciaService = inject(FarmaciaService);
  dialog: MatDialog = inject(MatDialog);
  snack: MatSnackBar = inject(MatSnackBar);

  ofertas = signal<Oferta[] | null>(null);
  calificaciones = signal<CalificacionesFarmacia | null>(null);

  agotadas = computed(() => (this.ofertas() ?? []).filter((o) => o.stock <= 0).length);
  activas = computed(() => (this.ofertas() ?? []).length - this.agotadas());

  claseStock = claseStock;

  saludo = (this.auth.sesion()?.nombre ?? '').split(' ')[0];

  private get idFarmacia(): number {
    return this.auth.sesion()?.idFarmacia ?? 0;
  }

  ngOnInit() {
    this.cargar();
  }

  // GET /api/farmacias/{id}/ofertas y GET /api/farmacias/{id}/calificaciones
  cargar() {
    this.ofertaService.deFarmacia(this.idFarmacia).subscribe({
      next: (lista) => this.ofertas.set(lista),
      error: (e) => {
        this.ofertas.set([]);
        this.avisar(mensajeError(e));
      },
    });
    this.farmaciaService.calificaciones(this.idFarmacia).subscribe({
      next: (c) => this.calificaciones.set(c),
      error: () => this.calificaciones.set({ total: 0, promedio: null, calificaciones: [] }),
    });
  }

  editar(o: Oferta) {
    this.dialog
      .open(OfertaDialogComponent, {
        width: '440px',
        data: {
          modo: 'editar',
          id: o.id,
          nombre: o.nombreMedicamento,
          precio: o.precio,
          stock: o.stock,
        },
      })
      .afterClosed()
      .subscribe((ok) => ok && this.cargar());
  }

  // Pide confirmación y luego DELETE /api/ofertas/{id}
  eliminar(o: Oferta) {
    pedirConfirmacion(this.dialog, {
      titulo: 'Eliminar oferta',
      mensaje: `¿Eliminar esta oferta de ${o.nombreMedicamento}?`,
      confirmar: 'Eliminar',
      icono: 'delete',
      peligro: true,
    }).subscribe(() =>
      this.ofertaService.eliminar(o.id).subscribe({
        next: () => {
          this.avisar('Oferta eliminada');
          this.cargar();
        },
        error: (e) => this.avisar(mensajeError(e)),
      }),
    );
  }

  private avisar(mensaje: string) {
    this.snack.open(mensaje, 'OK', { duration: 3000 });
  }
}
