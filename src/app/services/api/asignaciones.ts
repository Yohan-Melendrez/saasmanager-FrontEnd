import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Asignacion } from '../../models/asignacion.interface';
import { environment } from '../../../environments/environment';

export interface AsignacionPayload {
  idLicencia: number;
  idEmpleado: number;
  [key: string]: any;
}

@Injectable({ providedIn: 'root' })
export class AsignacionesService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/asignaciones`;

  obtenerAsignaciones(): Observable<Asignacion[]> {
    return this.http.get<Asignacion[]>(this.apiUrl);
  }

  obtenerMisAsignaciones(idEmpleado: number): Observable<Asignacion[]> {
    return this.http.get<Asignacion[]>(`${this.apiUrl}/empleado/${idEmpleado}`);
  }

  crearAsignacion(payload: AsignacionPayload): Observable<Asignacion> {
    return this.http.post<Asignacion>(this.apiUrl, payload);
  }

  eliminarAsignacion(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
