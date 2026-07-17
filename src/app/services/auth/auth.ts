import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { AuthResponse, LoginRequest, RegisterRequest } from '../../models/auth.interface';
import { environment } from '../../../environments/environment';

const TOKEN_KEY = 'token';
const ROL_KEY = 'rol';
const USER_KEY = 'usuario';
const EMAIL_KEY = 'email';

type Rol = 'ROLE_ADMIN' | 'ROLE_USER';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/auth`;

  isAuthenticated = signal<boolean>(this.hayToken());
  rol = signal<Rol>(this.rolGuardado());
  nombreUsuario = signal<string>(this.nombreGuardado());
  emailUsuario = signal<string>(this.emailGuardado());

  login(payload: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, payload).pipe(
      tap((res) => this.guardarSesion(res))
    );
  }

  register(payload: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, payload).pipe(
      tap((res) => this.guardarSesion(res))
    );
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(ROL_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(EMAIL_KEY);
    this.isAuthenticated.set(false);
    this.rol.set('ROLE_USER');
    this.nombreUsuario.set('');
    this.emailUsuario.set('');
  }

  sincronizarSesion(nombre: string, email: string): void {
    localStorage.setItem(USER_KEY, nombre);
    localStorage.setItem(EMAIL_KEY, email);
    this.nombreUsuario.set(nombre);
    this.emailUsuario.set(email);
  }

  getToken(): string | null {
    const token = localStorage.getItem(TOKEN_KEY);
    return token && token !== 'undefined' && token !== 'null' ? token : null;
  }

  esAdmin(): boolean {
    return this.rol() === 'ROLE_ADMIN';
  }

  rolEtiqueta(): 'ADMIN' | 'EMPLEADO' {
    return this.esAdmin() ? 'ADMIN' : 'EMPLEADO';
  }

  private guardarSesion(res: AuthResponse): void {
    if (!res.token) return;

    const rol: Rol = res.rol === 'ROLE_ADMIN' ? 'ROLE_ADMIN' : 'ROLE_USER';
    const nombre = res.username || res.email || 'Usuario';
    const email = res.email || '';

    localStorage.setItem(TOKEN_KEY, res.token);
    localStorage.setItem(ROL_KEY, rol);
    localStorage.setItem(USER_KEY, nombre);
    localStorage.setItem(EMAIL_KEY, email);

    this.isAuthenticated.set(true);
    this.rol.set(rol);
    this.nombreUsuario.set(nombre);
    this.emailUsuario.set(email);
  }

  private hayToken(): boolean {
    return !!this.getToken();
  }

  private rolGuardado(): Rol {
    return (localStorage.getItem(ROL_KEY) as Rol) || 'ROLE_USER';
  }

  private nombreGuardado(): string {
    return localStorage.getItem(USER_KEY) || '';
  }

  private emailGuardado(): string {
    return localStorage.getItem(EMAIL_KEY) || '';
  }
}
