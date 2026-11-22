export class Favorito {
  id: number;
  nombre: string;
  nombreComercial?: string;
  precioDesde: number | null;
}


export interface FarmaciaFavorita {
  id: number;
  nombre: string;
  direccion: string;
  distrito: string;
}
