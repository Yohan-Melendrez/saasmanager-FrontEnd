export interface Licencia {
  idLicencia: number;
  tipoPlan?: string;           // Campo real que devuelve Spring Boot
  nombreProducto?: string;     // Campo alternativo/alias para compatibilidad
  costoMensual?: number;       // Costo mensual del plan en la BD
  asientosTotales?: number;    // Asientos en la BD
  fechaVencimiento?: string;
  estado?: 'ACTIVA' | 'INACTIVA' | 'EXPIRADA' | string;
  proveedor: {
    idProveedor: number;
    nombrePlataforma: string;
    categoriaServicio: string;
  };
}
