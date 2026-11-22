// Oferta de una farmacia para un medicamento (OfertaDTO del backend)
export interface Oferta {
  id: number;
  idMedicamento: number;
  nombreMedicamento: string;
  idFarmacia: number;
  nombreFarmacia: string;
  distrito: string;
  precio: number;
  stock: number;
  fechaActualizacion: string;
}

// POST /ofertas  (la farmacia que publica sale de la sesión)
export interface NuevaOferta {
  idMedicamento: number;
  idFarmacia: number;
  precio: number;
  stock: number;
}

// PUT /ofertas/{id} (ambos) o PUT /ofertas/{id}/precio-stock (solo uno)
export interface CambioOferta {
  precio?: number;
  stock?: number;
}
