import { Component, inject, OnInit, signal } from '@angular/core';
import { MatCard, MatCardActions, MatCardContent } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatFormField, MatInput, MatLabel, MatPrefix } from '@angular/material/input';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatCheckbox } from '@angular/material/checkbox';
import { AuthService } from '../../services/auth.service';
import { MedicamentoService } from '../../services/medicamento-service';
import { FavoritoService } from '../../services/favorito-service';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MedicamentoBusqueda } from '../../model/medicamento';
import { claseStock, mensajeError, textoStock } from '../../utils/utilidades';
import { CurrencyPipe } from '@angular/common';
import {
  MedicamentoDetalleDialogComponent
} from '../medicamento-detalle-dialog-component/medicamento-detalle-dialog-component';
import { ComparacionDialogComponent } from '../comparacion-dialog-component/comparacion-dialog-component';

@Component({
  imports: [
    MatCard,
    MatCardContent,
    MatIcon,
    ReactiveFormsModule,
    MatFormField,
    MatLabel,
    MatInput,
    MatButton,
    MatIconButton,
    MatCardActions,
    MatCheckbox,
    CurrencyPipe,
    MatPrefix
  ],
  selector: 'app-cliente-buscar-component',
  styleUrl: './cliente-buscar-component.css',
  templateUrl: './cliente-buscar-component.html',
})
export class ClienteBuscarComponent implements OnInit {
  fb: FormBuilder = inject(FormBuilder);
  auth: AuthService = inject(AuthService);
  medicamentoService: MedicamentoService = inject(MedicamentoService);
  favoritoService: FavoritoService = inject(FavoritoService);
  dialog: MatDialog = inject(MatDialog);
  snack: MatSnackBar = inject(MatSnackBar);

  form = this.fb.nonNullable.group({ nombre: [''] });
  sugerencias = ['Paracetamol', 'Ibuprofeno', 'Amoxicilina', 'Loratadina'];

  resultados = signal<MedicamentoBusqueda[] | null>(null); // null = todavía no buscó
  favoritos = signal<Set<number>>(new Set());
  seleccionados = signal<Set<number>>(new Set());
  buscando = signal(false);

  claseStock = claseStock;
  textoStock = textoStock;

  saludo = (this.auth.sesion()?.nombre ?? '').split(' ')[0];

  private get idCliente(): number {
    return this.auth.sesion()?.idCliente ?? 0;
  }

  ngOnInit() {
    this.cargarFavoritos();
  }

  cargarFavoritos() {
    this.favoritoService.medicamentos(this.idCliente).subscribe({
      next: (lista) => this.favoritos.set(new Set(lista.map((m) => m.id))),
      error: (e) => this.avisar(mensajeError(e)),
    });
  }

  // GET /api/medicamentos/buscar?nombre=
  buscar() {
    const nombre = this.form.getRawValue().nombre.trim();
    if (!nombre) {
      this.avisar('Escribe el nombre de un medicamento');
      return;
    }
    this.buscando.set(true);
    this.medicamentoService.buscar(nombre).subscribe({
      next: (lista) => {
        this.resultados.set(lista);
        this.buscando.set(false);
      },
      error: (e) => {
        this.buscando.set(false);
        this.avisar(mensajeError(e));
      },
    });
  }

  sugerir(nombre: string) {
    this.form.setValue({ nombre });
    this.buscar();
  }

  // Agrega o quita el medicamento de favoritos
  toggleFavorito(id: number) {
    const esFavorito = this.favoritos().has(id);
    const peticion = esFavorito
      ? this.favoritoService.quitarMedicamento(this.idCliente, id)
      : this.favoritoService.agregarMedicamento(this.idCliente, id);
    peticion.subscribe({
      next: () => {
        const nuevo = new Set(this.favoritos());
        if (esFavorito) nuevo.delete(id);
        else nuevo.add(id);
        this.favoritos.set(nuevo);
        this.avisar(esFavorito ? 'Quitado de favoritos' : 'Guardado en favoritos');
      },
      error: (e) => this.avisar(mensajeError(e)),
    });
  }

  toggleComparar(id: number, marcado: boolean) {
    const nuevo = new Set(this.seleccionados());
    if (marcado) nuevo.add(id);
    else nuevo.delete(id);
    this.seleccionados.set(nuevo);
  }

  limpiar() {
    this.seleccionados.set(new Set());
  }

  comparar() {
    if (this.seleccionados().size < 2) {
      this.avisar('Selecciona al menos dos medicamentos para comparar');
      return;
    }
    this.dialog.open(ComparacionDialogComponent, {
      width: '720px',
      maxWidth: '95vw',
      data: { ids: [...this.seleccionados()] },
    });
  }

  verDetalle(id: number) {
    this.dialog.open(MedicamentoDetalleDialogComponent, {
      width: '720px',
      maxWidth: '95vw',
      data: { id },
    });
  }

  private avisar(mensaje: string) {
    this.snack.open(mensaje, 'OK', { duration: 3000 });
  }
}
