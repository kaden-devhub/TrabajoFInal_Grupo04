export class Cliente {
  id?: number;
  nombre: string;
  apellidos: string;
  correo: string;
  contrasena: string;
}

// Lo que devuelve GET /clientes/{id} (sin contraseña)
export type ClientePublico = Omit<Cliente, 'contrasena'>;
