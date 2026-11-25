import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { OfertaService } from '../../service/oferta-service';
import { FarmaciaService } from '../../service/farmacia-service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FarmaciaPublica } from '../../model/farmacia';
import { Oferta } from '../../model/oferta';
import { claseStock, mensajeError, textoStock } from '../../utils/utilidades';

@Component({
  imports: [],
  selector: 'app-cliente-ofertas-component',
  styleUrl: './cliente-ofertas-component.css',
  templateUrl: './cliente-ofertas-component.html',
})
export class ClienteOfertasComponent implements OnInit {
  fb: FormBuilder = inject(FormBuilder);
  ofertaService: OfertaService = inject(OfertaService);
  farmaciaService: FarmaciaService = inject(FarmaciaService);
  snack: MatSnackBar = inject(MatSnackBar);

  form = this.fb.nonNullable.group({
    farmaciaId: ['' as string | number],
    distrito: [''],
  });

  farmacias = signal<FarmaciaPublica[]>([]);
  distritos = computed(() => [...new Set(this.farmacias().map((f) => f.distrito))].sort());
  ofertas = signal<Oferta[] | null>(null);

  claseStock = claseStock;
  textoStock = textoStock;

  ngOnInit() {
    // Llena los filtros con las farmacias activas
    this.farmaciaService.listar({ estado: 'activa' }).subscribe({
      next: (lista) => this.farmacias.set(lista),
      error: (e) => this.avisar(mensajeError(e)),
    });
    this.filtrar();
  }

  // GET /api/ofertas?farmaciaId=&distrito=
  filtrar() {
    this.ofertaService.listar(this.form.getRawValue()).subscribe({
      next: (lista) => this.ofertas.set(lista),
      error: (e) => {
        this.ofertas.set([]);
        this.avisar(mensajeError(e));
      },
    });
  }

  private avisar(mensaje: string) {
    this.snack.open(mensaje, 'OK', { duration: 3000 });
  }
}
