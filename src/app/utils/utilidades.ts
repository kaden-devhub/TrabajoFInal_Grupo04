// El backend responde { fecha, estado, mensaje, errores? }
export function mensajeError(e: any): string {
  if (e?.status === 0) {
    return 'No se pudo conectar con el servidor';
  }
  const cuerpo = e?.error;
  if (cuerpo?.errores?.length) {
    return cuerpo.errores.join('. ');
  }
  return cuerpo?.mensaje || e?.message || 'Ocurrió un error';
}

// Etiqueta de stock: agotado / pocas unidades / disponible
export function claseStock(n: number): string {
  return n <= 0 ? 'agotado' : n <= 10 ? 'poco' : 'ok';
}

export function textoStock(n: number): string {
  return n <= 0 ? 'Agotado' : n <= 10 ? `Quedan ${n}` : `${n} disp.`;
}

// Arma el arreglo [1..5] para pintar estrellas
export const ESTRELLAS = [1, 2, 3, 4, 5];
