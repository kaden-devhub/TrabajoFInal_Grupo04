import {Centromedico} from './centromedico';
import {Especialidad} from './especialidad';

export class Medico {
  id: string;
  numerocolegiatura: number;
  nombre: string;
  apellido: string;
  fechaNacimiento: Date = new Date();
  centroMedico: Centromedico;
  especialidades: Especialidad;
}
