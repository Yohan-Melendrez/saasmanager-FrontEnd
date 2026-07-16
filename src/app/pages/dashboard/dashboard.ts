import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ProveedoresService } from '../../services/api/proveedores';
import { LicenciasService } from '../../services/api/licencias';
import { AsignacionesService } from '../../services/api/asignaciones';
import { Proveedor } from '../../models/proveedor.interface';
import { Licencia } from '../../models/licencia.interface';
import { Asignacion } from '../../models/asignacion.interface';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class DashboardComponent implements OnInit {
  private proveedoresService = inject(ProveedoresService);
  private licenciasService = inject(LicenciasService);
  private asignacionesService = inject(AsignacionesService);
  private router = inject(Router);

  proveedores = signal<Proveedor[]>([]);
  licencias = signal<Licencia[]>([]);
  asignaciones = signal<Asignacion[]>([]);
  loading = signal<boolean>(true);

  totalProveedores = computed(() => this.proveedores().length);
  totalLicencias = computed(() => this.licencias().length);
  licenciasActivas = computed(() => this.licencias().filter(l => this.obtenerEstado(l) === 'ACTIVA').length);
  licenciasExpiradas = computed(() => this.licencias().filter(l => this.obtenerEstado(l) === 'EXPIRADA').length);
  licenciasListaExpirada = computed(() => this.licencias().filter(l => this.obtenerEstado(l) === 'EXPIRADA'));
  totalAsignaciones = computed(() => this.asignaciones().filter(a => a.estatusActivo !== false).length);
  
  licenciasRecientes = computed(() => [...this.licencias()]);
  proveedoresRecientes = computed(() => [...this.proveedores()]);
  asignacionesRecientes = computed(() => [...this.asignaciones()]);

  ngOnInit(): void {
    this.cargarDatos();

    setTimeout(() => {
      if (this.loading()) {
        if (this.licencias().length === 0) {
          this.licencias.set(this.mockLicencias());
          this.proveedores.set(this.mockProveedores());
        }
        if (this.asignaciones().length === 0) {
          this.asignaciones.set(this.mockAsignaciones());
        }
        this.loading.set(false);
      }
    }, 1200);
  }

  cargarDatos(): void {
    this.loading.set(true);

    this.proveedoresService.obtenerProveedores().subscribe({
      next: (data) => this.proveedores.set((Array.isArray(data) && data.length > 0) ? data : this.mockProveedores()),
      error: () => this.proveedores.set(this.mockProveedores()),
    });

    this.licenciasService.obtenerLicencias().subscribe({
      next: (data) => {
        if (Array.isArray(data) && data.length > 0) {
          this.licencias.set(data);
        } else {
          this.licencias.set(this.mockLicencias());
          if (this.proveedores().length === 0) {
            this.proveedores.set(this.mockProveedores());
          }
        }
        this.loading.set(false);
      },
      error: () => {
        this.licencias.set(this.mockLicencias());
        if (this.proveedores().length === 0) {
          this.proveedores.set(this.mockProveedores());
        }
        this.loading.set(false);
      },
    });

    this.asignacionesService.obtenerAsignaciones().subscribe({
      next: (data) => this.asignaciones.set((Array.isArray(data) && data.length > 0) ? data : this.mockAsignaciones()),
      error: () => this.asignaciones.set(this.mockAsignaciones()),
    });
  }

  obtenerEstado(lic: Licencia): 'ACTIVA' | 'INACTIVA' | 'EXPIRADA' {
    if (lic?.estado && (lic.estado === 'ACTIVA' || lic.estado === 'INACTIVA' || lic.estado === 'EXPIRADA')) {
      return lic.estado;
    }
    if (lic?.fechaVencimiento) {
      const hoy = new Date().toISOString().split('T')[0];
      if (lic.fechaVencimiento < hoy) return 'EXPIRADA';
    }
    return 'ACTIVA';
  }

  obtenerTitulo(lic: Licencia): string {
    return lic?.tipoPlan || lic?.nombreProducto || lic?.proveedor?.nombrePlataforma || 'Licencia de Software';
  }

  obtenerFechaVencimiento(lic: Licencia): string {
    return lic?.fechaVencimiento || '2026-12-31';
  }

  irALicencias(id?: number): void {
    if (id) {
      this.router.navigate(['/licencias'], { queryParams: { editarId: id } });
    } else {
      this.router.navigate(['/licencias']);
    }
  }

  irAProveedores(id?: number): void {
    if (id) {
      this.router.navigate(['/proveedores'], { queryParams: { editarId: id } });
    } else {
      this.router.navigate(['/proveedores']);
    }
  }

  irAAsignaciones(id?: number): void {
    if (id) {
      this.router.navigate(['/asignaciones'], { queryParams: { editarId: id } });
    } else {
      this.router.navigate(['/asignaciones']);
    }
  }

  private mockProveedores(): Proveedor[] {
    return [
      { idProveedor: 1, nombrePlataforma: 'Microsoft Azure', categoriaServicio: 'Productividad' },
      { idProveedor: 2, nombrePlataforma: 'Amazon Web Services (AWS)', categoriaServicio: 'Infraestructura' },
      { idProveedor: 3, nombrePlataforma: 'GitHub Enterprise', categoriaServicio: 'Desarrollo' },
      { idProveedor: 4, nombrePlataforma: 'Google Cloud Platform', categoriaServicio: 'Colaboración' },
      { idProveedor: 5, nombrePlataforma: 'Slack', categoriaServicio: 'Comunicación' },
      { idProveedor: 6, nombrePlataforma: 'Figma', categoriaServicio: 'Diseño' },
    ];
  }

  private mockLicencias(): Licencia[] {
    return [
      { idLicencia: 1, tipoPlan: 'Microsoft 365 E5 & Azure AD Premium', nombreProducto: 'Microsoft 365 E5', fechaVencimiento: '2026-12-31', costoMensual: 1850.00, asientosTotales: 80, estado: 'ACTIVA', proveedor: { idProveedor: 1, nombrePlataforma: 'Microsoft Azure', categoriaServicio: 'Productividad' } },
      { idLicencia: 2, tipoPlan: 'AWS Enterprise Support & Compute Pack', nombreProducto: 'AWS Enterprise Pack', fechaVencimiento: '2026-06-30', costoMensual: 2500.00, asientosTotales: 25, estado: 'ACTIVA', proveedor: { idProveedor: 2, nombrePlataforma: 'Amazon Web Services (AWS)', categoriaServicio: 'Infraestructura' } },
      { idLicencia: 3, tipoPlan: 'GitHub Enterprise Cloud + Copilot', nombreProducto: 'GitHub Enterprise', fechaVencimiento: '2026-03-15', costoMensual: 950.00, asientosTotales: 40, estado: 'ACTIVA', proveedor: { idProveedor: 3, nombrePlataforma: 'GitHub Enterprise', categoriaServicio: 'Desarrollo' } },
      { idLicencia: 4, tipoPlan: 'Google Workspace Enterprise Plus', nombreProducto: 'Google Workspace', fechaVencimiento: '2026-09-01', costoMensual: 1200.50, asientosTotales: 100, estado: 'ACTIVA', proveedor: { idProveedor: 4, nombrePlataforma: 'Google Cloud Platform', categoriaServicio: 'Colaboración' } },
      { idLicencia: 5, tipoPlan: 'Slack Enterprise Grid Pro', nombreProducto: 'Slack Pro', fechaVencimiento: '2025-01-20', costoMensual: 450.00, asientosTotales: 50, estado: 'EXPIRADA', proveedor: { idProveedor: 5, nombrePlataforma: 'Slack', categoriaServicio: 'Comunicación' } },
      { idLicencia: 6, tipoPlan: 'Figma Organization Unlimited', nombreProducto: 'Figma Org', fechaVencimiento: '2026-02-28', costoMensual: 600.00, asientosTotales: 30, estado: 'ACTIVA', proveedor: { idProveedor: 6, nombrePlataforma: 'Figma', categoriaServicio: 'Diseño' } },
    ];
  }

  private mockAsignaciones(): Asignacion[] {
    return [
      {
        idAsignacion: 1,
        fechaAsignacion: '2026-01-15',
        correoEmpleado: 'carlos.martinez@empresa.com',
        estatusActivo: true,
        licencia: { idLicencia: 1, tipoPlan: 'Microsoft 365 E5 & Azure AD Premium', nombreProducto: 'Microsoft 365 E5', fechaVencimiento: '2026-12-31', costoMensual: 1850.00, asientosTotales: 80, estado: 'ACTIVA', proveedor: { idProveedor: 1, nombrePlataforma: 'Microsoft Azure', categoriaServicio: 'Productividad' } }
      },
      {
        idAsignacion: 2,
        fechaAsignacion: '2026-02-01',
        correoEmpleado: 'maria.fernandez@empresa.com',
        estatusActivo: true,
        licencia: { idLicencia: 3, tipoPlan: 'GitHub Enterprise Cloud + Copilot', nombreProducto: 'GitHub Enterprise', fechaVencimiento: '2026-03-15', costoMensual: 950.00, asientosTotales: 40, estado: 'ACTIVA', proveedor: { idProveedor: 3, nombrePlataforma: 'GitHub Enterprise', categoriaServicio: 'Desarrollo' } }
      },
      {
        idAsignacion: 3,
        fechaAsignacion: '2026-03-10',
        correoEmpleado: 'roberto.gonzalez@empresa.com',
        estatusActivo: true,
        licencia: { idLicencia: 4, tipoPlan: 'Google Workspace Enterprise Plus', nombreProducto: 'Google Workspace', fechaVencimiento: '2026-09-01', costoMensual: 1200.50, asientosTotales: 100, estado: 'ACTIVA', proveedor: { idProveedor: 4, nombrePlataforma: 'Google Cloud Platform', categoriaServicio: 'Colaboración' } }
      }
    ];
  }
}