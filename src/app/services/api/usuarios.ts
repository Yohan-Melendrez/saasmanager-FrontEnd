import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Usuario, UpdateUserRequest } from '../../models/usuario.interface';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UsuariosService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/users`;

  obtenerPerfil(): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.apiUrl}/me`);
  }

  actualizarPerfil(payload: UpdateUserRequest): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.apiUrl}/me`, payload);
  }

  actualizarUsuario(id: number, payload: UpdateUserRequest): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.apiUrl}/${id}`, payload);
  }
}
