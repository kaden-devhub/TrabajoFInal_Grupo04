export class Farmacia {
  id?: number;
  nombre: string;
  licencia: string;
  correo: string;
  contrasena: string;
  direccion: string;
  distrito: string;
  telefono: string;
  horario: string;
  estado?: string;
}

// Lo que devuelve el backend en las consultas públicas (sin correo ni contraseña)
export type FarmaciaPublica = Omit<Farmacia, 'contrasena' | 'correo'>;

// PUT /farmacias/{id}
export interface DatosFarmacia {
  nombre: string;
  licencia: string;
  direccion: string;
  distrito: string;
}

// PUT /farmacias/{id}/perfil-comercial
export interface PerfilComercial {
  telefono: string;
  horario: string;
}
