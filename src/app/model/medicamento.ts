
// GET /medicamentos/buscar?nombre=  (cada medicamento con las farmacias que lo tienen, de más barata a más cara)
import { Oferta } from './oferta';

export interface MedicamentoBusqueda {
  id: number;
  nombre: string;
  nombreComercial?: string;
  farmacias: Oferta[];
}

export interface Medicamento {
  id: number;
  nombre: string;
  nombreComercial?: string;
  principioActivo?: string;
  concentracion?: string;
  presentacion?: string;
  laboratorio?: string;
  descripcion?: string;
  advertencias?: string;
  nombreCategoria?: string;
  idCategoria?: number;
}

// GET /medicamentos/{id}/recomendaciones
export interface Recomendacion {
  id: number;
  nombre: string;
  nombreComercial?: string;
  precioMinimo: number;
}

// GET /medicamentos/{id}/reporte-precios
export interface ReportePrecios {
  idMedicamento: number;
  medicamento: string;
  totalOfertas: number;
  precioMinimo: number | null;
  precioMaximo: number | null;
  precioPromedio: number | null;
  ofertas: Oferta[];
}

// GET /medicamentos/comparacion?ids=1,2
export interface Comparacion {
  id: number;
  nombre: string;
  nombreComercial?: string;
  ofertaMasBarata: Oferta | null;
  ofertas: Oferta[];
}

// POST /medicamentos y PUT /medicamentos/{id} (idFarmacia = quien lo registra o edita)
export interface MedicamentoForm {
  nombre: string;
  nombreComercial?: string;
  principioActivo?: string;
  concentracion?: string;
  presentacion?: string;
  laboratorio?: string;
  descripcion?: string;
  advertencias?: string;
  idCategoria?: number;
  idFarmacia?: number;
}

