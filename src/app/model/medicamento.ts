import {Proveedor} from './proveedor';
import {Centromedico} from './centromedico';

export class Medicamento {
  id: string;
  nombreComercial: string;
  principioActivo: string;
  laboratorio: string;
  presentacion: string;
  fechaRegistro: string;
  descripcion: string;
  precio: number;
  stock: number;
  proveedor: Proveedor;
  centroMedico: Centromedico
}
