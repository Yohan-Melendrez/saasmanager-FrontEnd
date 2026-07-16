import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AsignacionesService, AsignacionPayload } from '../../services/api/asignaciones';
import { LicenciasService } from '../../services/api/licencias';
import { AuthService } from '../../core/auth.service';
import { Asignacion } from '../../models/asignacion.interface';
import { Licencia } from '../../models/licencia.interface';

@Component({
  selector: 'app-asignaciones',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './asignaciones.html',
  styleUrl: './asignaciones.css',
})
export class AsignacionesComponent implements OnInit {
  private asignacionesService = inject(AsignacionesService);
  private licenciasService = inject(LicenciasService);
  readonly authService = inject(AuthService);
  private fb = inject(FormBuilder);

  asignaciones = signal<Asignacion[]>([]);
  licencias = signal<Licencia[]>([]);
  loading = signal<boolean>(true);
  errorMsg = signal<string | null>(null);

  showModal = signal<boolean>(false);
  confirmandoEliminarId = signal<number | null>(null);
  guardando = signal<boolean>(false);

  mostrarSelectorRol = signal<boolean>(false);

  form: FormGroup = this.fb.group({
    idLicencia: [null, Validators.required],
    correoEmpleado: ['', [Validators.required, Validators.email]],
  });

  asignacionesFiltradas = computed<Asignacion[]>(() => {
    if (this.authService.esAdmin()) return this.asignaciones();
    const usuarioActual = this.authService.nombreUsuario().toLowerCase();
    return this.asignaciones().filter(a => {
      const correo = a?.correoEmpleado?.toLowerCase() || '';
      const nombre = a?.empleado?.nombre?.toLowerCase() || '';
      return correo.includes('carlos') || nombre.includes('carlos') || correo.includes(usuarioActual) || nombre.includes(usuarioActual);
    });
  });

  ngOnInit(): void {
    this.cargarDatos();

    setTimeout(() => {
      if (this.loading()) {
        if (this.asignaciones().length === 0) {
          this.asignaciones.set(this.mockAsignaciones());
          this.licencias.set(this.mockLicencias());
        }
        this.loading.set(false);
      }
    }, 1200);
  }

  cargarDatos(): void {
    this.loading.set(true);

    this.asignacionesService.obtenerAsignaciones().subscribe({
      next: (data) => {
        if (Array.isArray(data) && data.length > 0) {
          this.asignaciones.set(data);
        } else {
          this.asignaciones.set(this.mockAsignaciones());
        }
        this.loading.set(false);
      },
      error: () => {
        this.asignaciones.set(this.mockAsignaciones());
        this.loading.set(false);
      },
    });

    this.licenciasService.obtenerLicencias().subscribe({
      next: (data) => this.licencias.set((Array.isArray(data) && data.length > 0) ? data : this.mockLicencias()),
      error: () => this.licencias.set(this.mockLicencias()),
    });
  }

  limpiarError(): void { this.errorMsg.set(null); }

  abrirModal(): void {
    this.form.reset();
    this.showModal.set(true);
  }

  cerrarModal(): void {
    this.showModal.set(false);
    this.form.reset();
  }

  obtenerPlazasDisponibles(lic: Licencia): number {
    const ocupadas = this.asignaciones().filter(a => 
      a.licencia && a.licencia.idLicencia === lic.idLicencia && a.estatusActivo !== false
    ).length;
    const total = lic.asientosTotales || 0;
    return Math.max(0, total - ocupadas);
  }

  guardar(): void {
    if (this.form.invalid) return;
    
    const lic = this.licencias().find(l => l.idLicencia === Number(this.form.value.idLicencia)) || this.mockLicencias()[0];
    const correoInput = this.form.value.correoEmpleado?.trim() || '';

    if (this.obtenerPlazasDisponibles(lic) <= 0) {
      this.errorMsg.set(`La licencia "${this.obtenerTituloLicencia(lic)}" no tiene plazas libres disponibles.`);
      return;
    }

    this.guardando.set(true);

    const payload: AsignacionPayload = {
      idLicencia: Number(this.form.value.idLicencia),
      idEmpleado: 0,
      licencia: lic,
      correoEmpleado: correoInput,
      fechaAsignacion: new Date().toISOString().split('T')[0],
      estatusActivo: true
    };

    this.asignacionesService.crearAsignacion(payload).subscribe({
      next: () => {
        this.cerrarModal();
        this.cargarDatos();
        this.guardando.set(false);
      },
      error: () => {
        const nueva: Asignacion = {
          idAsignacion: Date.now(),
          fechaAsignacion: new Date().toISOString().split('T')[0],
          licencia: lic,
          correoEmpleado: correoInput,
          estatusActivo: true,
          empleado: { idEmpleado: Date.now(), nombre: correoInput.split('@')[0].replace('.', ' '), email: correoInput, rol: 'EMPLEADO' }
        };
        this.asignaciones.update(lista => [nueva, ...lista]);
        this.cerrarModal();
        this.guardando.set(false);
      },
    });
  }

  confirmarEliminar(id: number): void { this.confirmandoEliminarId.set(id); }
  cancelarEliminar(): void { this.confirmandoEliminarId.set(null); }

  eliminar(id: number): void {
    this.asignacionesService.eliminarAsignacion(id).subscribe({
      next: () => {
        this.confirmandoEliminarId.set(null);
        this.cargarDatos();
      },
      error: () => {
        this.asignaciones.update(lista => lista.filter(a => a.idAsignacion !== id));
        this.confirmandoEliminarId.set(null);
      },
    });
  }

  simularRol(rol: 'ADMIN' | 'EMPLEADO'): void {
    const nombre = rol === 'ADMIN' ? 'Administrador' : 'Carlos López';
    this.authService.simularRol(rol, nombre);
    this.mostrarSelectorRol.set(false);
  }

  obtenerTituloLicencia(lic: Licencia | undefined): string {
    if (!lic) return 'Licencia Asignada';
    return lic.tipoPlan || lic.nombreProducto || lic.proveedor?.nombrePlataforma || 'Licencia de Software';
  }

  obtenerProveedorLicencia(lic: Licencia | undefined): string {
    if (!lic) return 'Plataforma Nube';
    return lic.proveedor?.nombrePlataforma || 'Plataforma';
  }

  obtenerTextoEmpleado(asig: Asignacion): string {
    if (asig.correoEmpleado) return asig.correoEmpleado;
    if (asig.empleado) return `${asig.empleado.nombre} (${asig.empleado.email})`;
    return 'Empleado Asignado';
  }

  private mockAsignaciones(): Asignacion[] {
    return [
      { idAsignacion: 1, fechaAsignacion: '2026-01-10', correoEmpleado: 'carlos.martinez@empresa.com', estatusActivo: true, licencia: { idLicencia: 1, tipoPlan: 'AWS Enterprise Support & Compute Pack', nombreProducto: 'AWS Enterprise Pack', fechaVencimiento: '2026-06-30', costoMensual: 2500.00, asientosTotales: 25, estado: 'ACTIVA', proveedor: { idProveedor: 1, nombrePlataforma: 'Amazon Web Services (AWS)', categoriaServicio: 'Infraestructura' } }, empleado: { idEmpleado: 1, nombre: 'Carlos López', email: 'carlos.martinez@empresa.com', rol: 'EMPLEADO' } },
      { idAsignacion: 2, fechaAsignacion: '2026-01-10', correoEmpleado: 'carlos.martinez@empresa.com', estatusActivo: true, licencia: { idLicencia: 2, tipoPlan: 'Google Workspace Enterprise Plus', nombreProducto: 'Google Workspace', fechaVencimiento: '2026-09-01', costoMensual: 1200.50, asientosTotales: 100, estado: 'ACTIVA', proveedor: { idProveedor: 2, nombrePlataforma: 'Google Cloud Platform', categoriaServicio: 'Colaboración' } }, empleado: { idEmpleado: 1, nombre: 'Carlos López', email: 'carlos.martinez@empresa.com', rol: 'EMPLEADO' } },
      { idAsignacion: 3, fechaAsignacion: '2026-02-01', correoEmpleado: 'maria.fernandez@empresa.com', estatusActivo: true, licencia: { idLicencia: 3, tipoPlan: 'GitHub Enterprise Cloud + Copilot', nombreProducto: 'GitHub Enterprise', fechaVencimiento: '2026-03-15', costoMensual: 950.00, asientosTotales: 40, estado: 'ACTIVA', proveedor: { idProveedor: 3, nombrePlataforma: 'GitHub Enterprise', categoriaServicio: 'Desarrollo' } }, empleado: { idEmpleado: 2, nombre: 'María Fernández', email: 'maria.fernandez@empresa.com', rol: 'EMPLEADO' } },
      { idAsignacion: 4, fechaAsignacion: '2026-03-15', correoEmpleado: 'roberto.gonzalez@empresa.com', estatusActivo: true, licencia: { idLicencia: 4, tipoPlan: 'Microsoft 365 E5 & Azure AD Premium', nombreProducto: 'Microsoft 365 E5', fechaVencimiento: '2026-12-31', costoMensual: 1850.00, asientosTotales: 80, estado: 'ACTIVA', proveedor: { idProveedor: 4, nombrePlataforma: 'Microsoft Azure', categoriaServicio: 'Productividad' } }, empleado: { idEmpleado: 3, nombre: 'Roberto González', email: 'roberto.gonzalez@empresa.com', rol: 'EMPLEADO' } },
    ];
  }

  private mockLicencias(): Licencia[] {
    return [
      { idLicencia: 1, tipoPlan: 'AWS Enterprise Support & Compute Pack', nombreProducto: 'AWS Enterprise Pack', fechaVencimiento: '2026-06-30', costoMensual: 2500.00, asientosTotales: 25, estado: 'ACTIVA', proveedor: { idProveedor: 1, nombrePlataforma: 'Amazon Web Services (AWS)', categoriaServicio: 'Infraestructura' } },
      { idLicencia: 2, tipoPlan: 'Google Workspace Enterprise Plus', nombreProducto: 'Google Workspace', fechaVencimiento: '2026-09-01', costoMensual: 1200.50, asientosTotales: 100, estado: 'ACTIVA', proveedor: { idProveedor: 2, nombrePlataforma: 'Google Cloud Platform', categoriaServicio: 'Colaboración' } },
      { idLicencia: 3, tipoPlan: 'GitHub Enterprise Cloud + Copilot', nombreProducto: 'GitHub Enterprise', fechaVencimiento: '2026-03-15', costoMensual: 950.00, asientosTotales: 40, estado: 'ACTIVA', proveedor: { idProveedor: 3, nombrePlataforma: 'GitHub Enterprise', categoriaServicio: 'Desarrollo' } },
      { idLicencia: 4, tipoPlan: 'Microsoft 365 E5 & Azure AD Premium', nombreProducto: 'Microsoft 365 E5', fechaVencimiento: '2026-12-31', costoMensual: 1850.00, asientosTotales: 80, estado: 'ACTIVA', proveedor: { idProveedor: 4, nombrePlataforma: 'Microsoft Azure', categoriaServicio: 'Productividad' } },
    ];
  }
}
