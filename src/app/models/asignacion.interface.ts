import { Licencia } from './licencia.interface';
import { Empleado } from './empleado.interface';

export interface Asignacion {
  idAsignacion: number;
  fechaAsignacion: string;
  licencia: Licencia;
  correoEmpleado?: string;     // Campo devuelto por Spring Boot
  estatusActivo?: boolean;     // Campo devuelto por Spring Boot
  empleado?: Empleado;         // Campo alternativo/compatibilidad local
}
