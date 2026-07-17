export interface Proveedor {
  idProveedor: number;
  nombrePlataforma: string;
  categoriaServicio: string;
}

export interface DependenciasProveedor {
  licencias: number;
  asignaciones: number;
}