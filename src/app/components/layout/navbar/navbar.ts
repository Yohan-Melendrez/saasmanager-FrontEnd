import { Component, ElementRef, HostListener, inject, computed, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter } from 'rxjs';
import { AuthService } from '../../../services/auth/auth';

const RUTAS_SIN_NAV = ['/login', '/register'];

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  private authService = inject(AuthService);
  private router = inject(Router);
  private elementRef = inject(ElementRef);

  isAuthenticated = computed(() => this.authService.isAuthenticated());
  nombreUsuario = computed(() => this.authService.nombreUsuario());
  rol = computed(() => this.authService.rolEtiqueta());
  esAdmin = computed(() => this.authService.esAdmin());
  menuAbierto = signal<boolean>(false);

  private urlActual = signal<string>(this.router.url);
  mostrarNav = computed(() => !RUTAS_SIN_NAV.includes(this.urlActual().split('?')[0]));

  constructor() {
    this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe((e) => this.urlActual.set((e as NavigationEnd).urlAfterRedirects));
  }

  @HostListener('document:click', ['$event'])
  cerrarMenuAlClickAfuera(event: MouseEvent): void {
    if (this.menuAbierto() && !this.elementRef.nativeElement.contains(event.target)) {
      this.menuAbierto.set(false);
    }
  }

  iniciales = computed<string>(() => {
    const nombre = this.authService.nombreUsuario();
    if (!nombre) return '?';
    return nombre
      .split(' ')
      .map((w: string) => w[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  });

  logout(): void {
    this.menuAbierto.set(false);
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
