import {Centromedico} from './centromedico';
import {Medicamento} from './medicamento';
import {Medico} from './medico';
import {Tiposervicio} from './tiposervicio';

export class Servicio {
  id: string;
  nombre: string;
  precio: number;
  descripcion: string;
  centroMedico: Centromedico;
  medicamento: Medicamento;
  medico: Medico;
  tipoServicio: Tiposervicio
}
