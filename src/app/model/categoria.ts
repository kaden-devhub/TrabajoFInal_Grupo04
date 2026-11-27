// GET /categorias
export interface Categoria {
  id: number;
  nombre: string;
  descripcion?: string;
}

// POST /categorias y PUT /categorias/{id}
export interface CategoriaForm {
  nombre: string;
  descripcion: string;
}
