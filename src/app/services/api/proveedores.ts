import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Proveedor } from '../../models/proveedor.interface';

export interface ProveedorPayload {
  nombrePlataforma: string;
  categoriaServicio: string;
}

@Injectable({
  providedIn: 'root',
})
export class ProveedoresService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8081/api/v1/proveedores';

  obtenerProveedores(): Observable<Proveedor[]> {
    return this.http.get<Proveedor[]>(this.apiUrl);
  }

  crearProveedor(payload: ProveedorPayload): Observable<Proveedor> {
    return this.http.post<Proveedor>(this.apiUrl, payload);
  }

  editarProveedor(id: number, payload: ProveedorPayload): Observable<Proveedor> {
    return this.http.put<Proveedor>(`${this.apiUrl}/${id}`, payload);
  }

  eliminarProveedor(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}