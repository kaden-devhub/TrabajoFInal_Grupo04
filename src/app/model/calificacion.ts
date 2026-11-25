export interface Ubicacion {
  id: number;
  nombre: string;
  direccion: string;
  distrito: string;
}

export interface Calificacion {
  nombreCliente: string;
  puntuacion: number;
  comentario?: string;
  fechaCreacion: string;
}

// GET /farmacias/{id}/calificaciones
export interface CalificacionesFarmacia {
  total: number;
  promedio: number | null;
  calificaciones: Calificacion[];
}

// POST /farmacias/{id}/calificaciones
export interface NuevaCalificacion {
  puntuacion: number;
  comentario?: string;
  idCliente?: number;
}

