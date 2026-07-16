import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Licencia } from '../../models/licencia.interface';

export interface LicenciaPayload {
  nombreProducto: string;
  fechaVencimiento: string;
  estado: 'ACTIVA' | 'INACTIVA' | 'EXPIRADA';
  proveedor: { idProveedor: number };
}

@Injectable({
  providedIn: 'root',
})
export class LicenciasService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8081/api/v1/licencias';

  obtenerLicencias(): Observable<Licencia[]> {
    return this.http.get<Licencia[]>(this.apiUrl);
  }

  obtenerLicenciaPorId(id: number): Observable<Licencia> {
    return this.http.get<Licencia>(`${this.apiUrl}/${id}`);
  }

  crearLicencia(payload: LicenciaPayload): Observable<Licencia> {
    return this.http.post<Licencia>(this.apiUrl, payload);
  }

  editarLicencia(id: number, payload: LicenciaPayload): Observable<Licencia> {
    return this.http.put<Licencia>(`${this.apiUrl}/${id}`, payload);
  }

  eliminarLicencia(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
