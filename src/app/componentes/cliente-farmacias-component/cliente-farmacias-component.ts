import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { FarmaciaService } from '../../services/farmacia-service';
import { FavoritoService } from '../../services/favorito-service';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FarmaciaPublica } from '../../model/farmacia';
import { mensajeError } from '../../utils/utilidades';

@Component({
  imports: [],
  selector: 'app-cliente-farmacias-component',
  styleUrl: './cliente-farmacias-component.css',
  templateUrl: './cliente-farmacias-component.html',
})
export class ClienteFarmaciasComponent {
  fb: FormBuilder = inject(FormBuilder);
  auth: AuthService = inject(AuthService);
  farmaciaService: FarmaciaService = inject(FarmaciaService);
  favoritoService: FavoritoService = inject(FavoritoService);
  dialog: MatDialog = inject(MatDialog);
  snack: MatSnackBar = inject(MatSnackBar);

  form = this.fb.nonNullable.group({ nombre: [''], distrito: [''] });

  todas = signal<FarmaciaPublica[]>([]); // farmacias activas (para llenar el filtro de distritos)
  distritos = computed(() => [...new Set(this.todas().map((f) => f.distrito))].sort());
  resultados = signal<FarmaciaPublica[] | null>(null);
  favoritas = signal<Set<number>>(new Set());

  private get idCliente(): number {
    return this.auth.sesion()?.idCliente ?? 0;
  }

  ngOnInit() {
    this.favoritoService.farmacias(this.idCliente).subscribe({
      next: (lista) => this.favoritas.set(new Set(lista.map((f) => f.id))),
      error: (e) => this.avisar(mensajeError(e)),
    });
    this.farmaciaService.listar({ estado: 'activa' }).subscribe({
      next: (lista) => {
        this.todas.set(lista);
        this.resultados.set(lista);
      },
      error: (e) => {
        this.resultados.set([]);
        this.avisar(mensajeError(e));
      },
    });
  }

  // Con nombre o distrito filtra; sin filtros lista las activas (HU12, HU13, HU14)
  buscar() {
    const { nombre, distrito } = this.form.getRawValue();
    const filtros =
      nombre.trim() || distrito ? { nombre: nombre.trim(), distrito } : { estado: 'activa' };
    this.farmaciaService.listar(filtros).subscribe({
      next: (lista) => this.resultados.set(lista),
      error: (e) => this.avisar(mensajeError(e)),
    });
  }

  // Agrega o quita la farmacia de favoritos (HU28 / HU51)
  toggleFavorita(id: number) {
    const esFavorita = this.favoritas().has(id);
    const peticion = esFavorita
      ? this.favoritoService.quitarFarmacia(this.idCliente, id)
      : this.favoritoService.agregarFarmacia(this.idCliente, id);
    peticion.subscribe({
      next: () => {
        const nuevo = new Set(this.favoritas());
        if (esFavorita) nuevo.delete(id);
        else nuevo.add(id);
        this.favoritas.set(nuevo);
        this.avisar(
          esFavorita ? 'Farmacia quitada de favoritos' : 'Farmacia guardada en favoritos',
        );
      },
      error: (e) => this.avisar(mensajeError(e)),
    });
  }

  verDetalle(id: number) {
    this.dialog.open(FarmaciaDetalleDialogComponent, {
      width: '560px',
      maxWidth: '95vw',
      data: { id },
    });
  }

  private avisar(mensaje: string) {
    this.snack.open(mensaje, 'OK', { duration: 3000 });
  }
}
