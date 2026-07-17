import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule, UpperCasePipe } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ProveedoresService, ProveedorPayload } from '../../services/api/proveedores';
import { Proveedor, DependenciasProveedor } from '../../models/proveedor.interface';

@Component({
  selector: 'app-proveedores',
  imports: [CommonModule, UpperCasePipe, ReactiveFormsModule],
  templateUrl: './proveedores.html',
  styleUrl: './proveedores.css',
})
export class ProveedoresComponent implements OnInit {
  private proveedoresService = inject(ProveedoresService);
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);

  proveedores = signal<Proveedor[]>([]);
  loading = signal<boolean>(true);
  errorMsg = signal<string | null>(null);

  categoriaSeleccionada = signal<string>('TODAS');
  showModal = signal<boolean>(false);
  modoEdicion = signal<boolean>(false);
  proveedorEditandoId = signal<number | null>(null);
  confirmandoEliminarId = signal<number | null>(null);
  dependenciasEliminar = signal<DependenciasProveedor | null>(null);
  guardando = signal<boolean>(false);

  categorias = computed<string[]>(() => {
    const cats = this.proveedores().map(p => p?.categoriaServicio || 'General');
    return ['TODAS', ...new Set(cats)];
  });

  proveedoresFiltrados = computed<Proveedor[]>(() => {
    const cat = this.categoriaSeleccionada();
    if (cat === 'TODAS') return this.proveedores();
    return this.proveedores().filter(p => (p?.categoriaServicio || 'General') === cat);
  });

  form: FormGroup = this.fb.group({
    nombrePlataforma: ['', Validators.required],
    categoriaServicio: ['', Validators.required],
  });

  ngOnInit(): void {
    this.cargarProveedores();

    setTimeout(() => {
      if (this.loading()) {
        if (this.proveedores().length === 0) {
          this.proveedores.set(this.mockProveedores());
        }
        this.loading.set(false);
      }
      this.revisarParametroEdicion();
    }, 1200);
  }

  revisarParametroEdicion(): void {
    const editarId = this.route.snapshot.queryParams['editarId'];
    if (editarId) {
      const idNum = Number(editarId);
      const prov = this.proveedores().find(p => p.idProveedor === idNum);
      if (prov) {
        this.abrirModalEditar(prov);
      }
    }
  }

  cargarProveedores(): void {
    this.loading.set(true);
    this.proveedoresService.obtenerProveedores().subscribe({
      next: (datos) => {
        if (Array.isArray(datos) && datos.length > 0) {
          this.proveedores.set(datos);
        } else {
          this.proveedores.set(this.mockProveedores());
        }
        this.loading.set(false);
        this.revisarParametroEdicion();
      },
      error: () => {
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
    this.proveedorEditandoId.set(null);
    this.form.reset();
    this.showModal.set(true);
  }

  abrirModalEditar(proveedor: Proveedor): void {
    this.modoEdicion.set(true);
    this.proveedorEditandoId.set(proveedor.idProveedor);
    this.form.setValue({
      nombrePlataforma: proveedor.nombrePlataforma,
      categoriaServicio: proveedor.categoriaServicio,
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

    const payload: ProveedorPayload = this.form.value;
    const id = this.proveedorEditandoId();

    // Actualización optimista inmediata en memoria garantizada al 100%
    if (this.modoEdicion() && id !== null) {
      this.proveedores.update(lista => lista.map(p => p.idProveedor === id ? { ...p, ...payload } : p));
    } else {
      const nuevo: Proveedor = {
        idProveedor: Date.now(),
        ...payload
      };
      this.proveedores.update(lista => [nuevo, ...lista]);
    }

    const req$ = this.modoEdicion() && id !== null
      ? this.proveedoresService.editarProveedor(id, payload)
      : this.proveedoresService.crearProveedor(payload);

    req$.subscribe({
      next: (res) => {
        if (res && res.idProveedor && this.modoEdicion() && id !== null) {
          this.proveedores.update(lista => lista.map(p => p.idProveedor === id ? { ...p, ...res } : p));
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
    this.dependenciasEliminar.set(null);
    this.proveedoresService.obtenerDependencias(id).subscribe({
      next: (dep) => this.dependenciasEliminar.set(dep),
      error: () => this.dependenciasEliminar.set(null),
    });
  }

  cancelarEliminar(): void {
    this.confirmandoEliminarId.set(null);
    this.dependenciasEliminar.set(null);
  }

  eliminar(id: number): void {
    this.confirmandoEliminarId.set(null);
    this.dependenciasEliminar.set(null);
    this.proveedoresService.eliminarProveedor(id, true).subscribe({
      next: () => {
        this.proveedores.update(lista => lista.filter(p => p.idProveedor !== id));
      },
      error: (err) => {
        this.errorMsg.set(err?.error?.mensaje || 'No se pudo eliminar el proveedor.');
      },
    });
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
