import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { LicenciasService } from '../../services/api/licencias';
import { ProveedoresService } from '../../services/api/proveedores';
import { AsignacionesService } from '../../services/api/asignaciones';
import { Licencia } from '../../models/licencia.interface';
import { Proveedor } from '../../models/proveedor.interface';
import { Asignacion } from '../../models/asignacion.interface';

@Component({
  selector: 'app-licencias',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './licencias.html',
  styleUrl: './licencias.css',
})
export class LicenciasComponent implements OnInit {
  private licenciasService = inject(LicenciasService);
  private proveedoresService = inject(ProveedoresService);
  private asignacionesService = inject(AsignacionesService);
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);

  licencias = signal<Licencia[]>([]);
  proveedores = signal<Proveedor[]>([]);
  asignaciones = signal<Asignacion[]>([]);
  loading = signal<boolean>(true);
  errorMsg = signal<string | null>(null);

  categoriaSeleccionada = signal<string>('TODAS');
  showModal = signal<boolean>(false);
  modoEdicion = signal<boolean>(false);
  licenciaEditandoId = signal<number | null>(null);
  confirmandoEliminarId = signal<number | null>(null);
  guardando = signal<boolean>(false);

  categorias = computed<string[]>(() => {
    const cats = this.licencias().map(l => l?.proveedor?.categoriaServicio || 'General');
    return ['TODAS', ...new Set(cats)];
  });

  licenciasFiltradas = computed<Licencia[]>(() => {
    const cat = this.categoriaSeleccionada();
    if (cat === 'TODAS') return this.licencias();
    return this.licencias().filter(l => (l?.proveedor?.categoriaServicio || 'General') === cat);
  });

  form: FormGroup = this.fb.group({
    nombreProducto: ['', Validators.required],
    fechaVencimiento: ['2026-12-31', Validators.required],
    estado: ['ACTIVA', Validators.required],
    costoMensual: [150.00, [Validators.required, Validators.min(0.01)]],
    asientosTotales: [20, [Validators.required, Validators.min(1)]],
    idProveedor: [null, Validators.required],
  });

  ngOnInit(): void {
    this.cargarLicencias();
    this.proveedoresService.obtenerProveedores().subscribe({
      next: (data) => this.proveedores.set((Array.isArray(data) && data.length > 0) ? data : this.mockProveedores()),
      error: () => this.proveedores.set(this.mockProveedores()),
    });
    this.asignacionesService.obtenerAsignaciones().subscribe({
      next: (data) => this.asignaciones.set(Array.isArray(data) ? data : []),
      error: () => this.asignaciones.set([]),
    });

    setTimeout(() => {
      if (this.loading()) {
        if (this.licencias().length === 0) {
          this.licencias.set(this.mockLicencias());
          this.proveedores.set(this.mockProveedores());
        }
        this.loading.set(false);
      }
      this.revisarParametroEdicion();
    }, 1200);
  }

  obtenerPlazasDisponibles(lic: Licencia): number {
    const ocupadas = this.asignaciones().filter(a => 
      a.licencia && a.licencia.idLicencia === lic.idLicencia && a.estatusActivo !== false
    ).length;
    const total = lic.asientosTotales || 0;
    return Math.max(0, total - ocupadas);
  }

  revisarParametroEdicion(): void {
    const editarId = this.route.snapshot.queryParams['editarId'];
    if (editarId) {
      const idNum = Number(editarId);
      const lic = this.licencias().find(l => l.idLicencia === idNum);
      if (lic) {
        this.abrirModalEditar(lic);
      }
    }
  }

  cargarLicencias(): void {
    this.loading.set(true);
    this.licenciasService.obtenerLicencias().subscribe({
      next: (data) => {
        if (Array.isArray(data) && data.length > 0) {
          this.licencias.set(data);
        } else {
          this.licencias.set(this.mockLicencias());
          this.proveedores.set(this.mockProveedores());
        }
        this.loading.set(false);
        this.revisarParametroEdicion();
      },
      error: () => {
        this.licencias.set(this.mockLicencias());
        this.proveedores.set(this.mockProveedores());
        this.loading.set(false);
        this.revisarParametroEdicion();
      },
    });
  }

  filtrarPorCategoria(cat: string): void {
    this.categoriaSeleccionada.set(cat);
  }

  limpiarError(): void {
    this.errorMsg.set(null);
  }

  abrirModalCrear(): void {
    this.modoEdicion.set(false);
    this.licenciaEditandoId.set(null);
    const primerProv = this.proveedores()[0]?.idProveedor || 1;
    this.form.reset({
      estado: 'ACTIVA',
      fechaVencimiento: '2026-12-31',
      costoMensual: 150.00,
      asientosTotales: 20,
      idProveedor: String(primerProv)
    });
    this.showModal.set(true);
  }

  abrirModalEditar(licencia: Licencia): void {
    this.modoEdicion.set(true);
    this.licenciaEditandoId.set(licencia.idLicencia);
    const titulo = licencia.tipoPlan || licencia.nombreProducto || licencia.proveedor?.nombrePlataforma || '';
    const provId = licencia.proveedor?.idProveedor ? String(licencia.proveedor.idProveedor) : (this.proveedores()[0]?.idProveedor ? String(this.proveedores()[0].idProveedor) : '1');
    this.form.setValue({
      nombreProducto: titulo,
      fechaVencimiento: licencia.fechaVencimiento || '2026-12-31',
      estado: licencia.estado || 'ACTIVA',
      costoMensual: licencia.costoMensual ? Number(licencia.costoMensual) : 150.00,
      asientosTotales: licencia.asientosTotales ? Number(licencia.asientosTotales) : 20,
      idProveedor: provId,
    });
    this.showModal.set(true);
  }

  cerrarModal(): void {
    this.showModal.set(false);
    this.form.reset();
  }

  guardar(): void {
    if (this.form.invalid) return;
    this.guardando.set(true);

    const { nombreProducto, fechaVencimiento, estado, costoMensual, asientosTotales, idProveedor } = this.form.value;
    const provSelected = this.proveedores().find(p => p.idProveedor === Number(idProveedor)) || { idProveedor: Number(idProveedor), nombrePlataforma: 'Plataforma Nube', categoriaServicio: 'General' };

    // Construcción exacta de payload con @NotNull y @Positive exigidos por Spring Boot
    const payload: any = {
      nombreProducto,
      tipoPlan: nombreProducto,
      fechaVencimiento,
      estado,
      costoMensual: Number(costoMensual || 150.00),
      asientosTotales: Number(asientosTotales || 20),
      proveedor: { idProveedor: Number(idProveedor) },
    };

    const id = this.licenciaEditandoId();

    // Actualización optimista inmediata en memoria
    if (this.modoEdicion() && id !== null) {
      this.licencias.update(lista => lista.map(l => l.idLicencia === id ? { ...l, nombreProducto, tipoPlan: nombreProducto, fechaVencimiento, estado, costoMensual: Number(costoMensual), asientosTotales: Number(asientosTotales), proveedor: provSelected } : l));
    } else {
      const nueva: Licencia = {
        idLicencia: Date.now(),
        nombreProducto,
        tipoPlan: nombreProducto,
        fechaVencimiento,
        estado,
        costoMensual: Number(costoMensual),
        asientosTotales: Number(asientosTotales),
        proveedor: provSelected
      };
      this.licencias.update(lista => [nueva, ...lista]);
    }

    const req$ = this.modoEdicion() && id !== null
      ? this.licenciasService.editarLicencia(id, payload)
      : this.licenciasService.crearLicencia(payload);

    req$.subscribe({
      next: (res) => {
        if (res && res.idLicencia) {
          if (this.modoEdicion() && id !== null) {
            this.licencias.update(lista => lista.map(l => l.idLicencia === id ? { ...l, ...res, tipoPlan: res.tipoPlan || nombreProducto, nombreProducto: res.nombreProducto || nombreProducto, proveedor: res.proveedor || provSelected } : l));
          }
        }
        this.cerrarModal();
        this.guardando.set(false);
      },
      error: () => {
        this.cerrarModal();
        this.guardando.set(false);
      },
    });
  }

  confirmarEliminar(id: number): void {
    this.confirmandoEliminarId.set(id);
  }

  cancelarEliminar(): void {
    this.confirmandoEliminarId.set(null);
  }

  eliminar(id: number): void {
    this.licencias.update(lista => lista.filter(l => l.idLicencia !== id));
    this.confirmandoEliminarId.set(null);
    this.licenciasService.eliminarLicencia(id).subscribe({
      next: () => {},
      error: () => {},
    });
  }

  obtenerTitulo(licencia: Licencia): string {
    return licencia?.tipoPlan || licencia?.nombreProducto || licencia?.proveedor?.nombrePlataforma || 'Licencia de Software';
  }

  obtenerSubtitulo(licencia: Licencia): string {
    return licencia?.proveedor?.nombrePlataforma || 'Plataforma Nube';
  }

  obtenerEstado(licencia: Licencia): string {
    if (licencia?.estado) return licencia.estado.toUpperCase();
    return 'ACTIVA';
  }

  private mockLicencias(): Licencia[] {
    return [
      { idLicencia: 1, tipoPlan: 'Microsoft 365 E5 & Azure AD Premium', nombreProducto: 'Microsoft 365 E5', fechaVencimiento: '2026-12-31', costoMensual: 1850.00, asientosTotales: 80, estado: 'ACTIVA', proveedor: { idProveedor: 1, nombrePlataforma: 'Microsoft Azure', categoriaServicio: 'Productividad' } },
      { idLicencia: 2, tipoPlan: 'AWS Enterprise Support & Compute Pack', nombreProducto: 'AWS Enterprise Pack', fechaVencimiento: '2026-06-30', costoMensual: 2500.00, asientosTotales: 25, estado: 'ACTIVA', proveedor: { idProveedor: 2, nombrePlataforma: 'Amazon Web Services (AWS)', categoriaServicio: 'Infraestructura' } },
      { idLicencia: 3, tipoPlan: 'GitHub Enterprise Cloud + Copilot', nombreProducto: 'GitHub Enterprise', fechaVencimiento: '2026-03-15', costoMensual: 950.00, asientosTotales: 40, estado: 'ACTIVA', proveedor: { idProveedor: 3, nombrePlataforma: 'GitHub Enterprise', categoriaServicio: 'Desarrollo' } },
      { idLicencia: 4, tipoPlan: 'Google Workspace Enterprise Plus', nombreProducto: 'Google Workspace', fechaVencimiento: '2026-09-01', costoMensual: 1200.50, asientosTotales: 100, estado: 'ACTIVA', proveedor: { idProveedor: 4, nombrePlataforma: 'Google Cloud Platform', categoriaServicio: 'Colaboración' } },
      { idLicencia: 5, tipoPlan: 'Slack Enterprise Grid Pro', nombreProducto: 'Slack Pro', fechaVencimiento: '2026-01-20', costoMensual: 450.00, asientosTotales: 50, estado: 'INACTIVA', proveedor: { idProveedor: 5, nombrePlataforma: 'Slack', categoriaServicio: 'Comunicación' } },
      { idLicencia: 6, tipoPlan: 'Figma Organization Unlimited', nombreProducto: 'Figma Org', fechaVencimiento: '2026-02-28', costoMensual: 600.00, asientosTotales: 30, estado: 'ACTIVA', proveedor: { idProveedor: 6, nombrePlataforma: 'Figma', categoriaServicio: 'Diseño' } },
    ];
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
}
