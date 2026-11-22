export type sesion = 'CLIENTE' | 'FARMACIA'| 'ADMINISTRADOR'

// Respuesta de los tres login del backend (SesionDTO)
export class Sesion {
  rol: Rol;
  idCliente?: number;
  idFarmacia?: number;
  idAdministrador?: number;
  nombre: string;
  token: string;
}
