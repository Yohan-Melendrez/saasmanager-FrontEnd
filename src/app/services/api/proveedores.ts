import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Proveedor, DependenciasProveedor } from '../../models/proveedor.interface';
import { environment } from '../../../environments/environment';

export interface ProveedorPayload {
  nombrePlataforma: string;
  categoriaServicio: string;
}

@Injectable({
  providedIn: 'root',
})
export class ProveedoresService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/proveedores`;

  obtenerProveedores(): Observable<Proveedor[]> {
    return this.http.get<Proveedor[]>(this.apiUrl);
  }

  crearProveedor(payload: ProveedorPayload): Observable<Proveedor> {
    return this.http.post<Proveedor>(this.apiUrl, payload);
  }

  editarProveedor(id: number, payload: ProveedorPayload): Observable<Proveedor> {
    return this.http.put<Proveedor>(`${this.apiUrl}/${id}`, payload);
  }

  eliminarProveedor(id: number, cascada = false): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}?cascada=${cascada}`);
  }

  obtenerDependencias(id: number): Observable<DependenciasProveedor> {
    return this.http.get<DependenciasProveedor>(`${this.apiUrl}/${id}/dependencias`);
  }
}