import {Administrador} from './administrador';

export class Centromedico {
  id: string;
  direccion: string;
  latitud: number;
  longitud: number;
  tipoGestion: string;
  telefono: string;
  distrito: string;
  ciudad: string;
  administrador: Administrador
}
