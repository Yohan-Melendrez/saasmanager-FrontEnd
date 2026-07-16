import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly ROL_KEY = 'rol';
  private readonly USER_KEY = 'usuario';

  rol = signal<'ADMIN' | 'EMPLEADO'>('ADMIN');
  nombreUsuario = signal<string>('Administrador');

  constructor() {
    this.cargarDesdeStorage();
  }

  private cargarDesdeStorage(): void {
    const rol = localStorage.getItem(this.ROL_KEY) as 'ADMIN' | 'EMPLEADO' | null;
    const nombre = localStorage.getItem(this.USER_KEY);
    if (rol) this.rol.set(rol);
    if (nombre) this.nombreUsuario.set(nombre);
  }

  esAdmin(): boolean {
    return this.rol() === 'ADMIN';
  }

  simularRol(rol: 'ADMIN' | 'EMPLEADO', nombre: string): void {
    this.rol.set(rol);
    this.nombreUsuario.set(nombre);
    localStorage.setItem(this.ROL_KEY, rol);
    localStorage.setItem(this.USER_KEY, nombre);
  }
}
