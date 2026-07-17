import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth/auth';
import { UsuariosService } from '../../services/api/usuarios';
import { UpdateUserRequest } from '../../models/usuario.interface';

@Component({
  selector: 'app-perfil',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './perfil.html',
  styleUrl: './perfil.css',
})
export class PerfilComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private usuariosService = inject(UsuariosService);

  cargando = signal<boolean>(true);
  guardando = signal<boolean>(false);
  guardado = signal<boolean>(false);
  errorMsg = signal<string | null>(null);
  rolEtiqueta = this.authService.rolEtiqueta();

  private original = { username: '', email: '' };

  form: FormGroup = this.fb.group({
    username: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    passwordActual: [''],
    passwordNuevo: [''],
  });

  ngOnInit(): void {
    this.usuariosService.obtenerPerfil().subscribe({
      next: (u) => {
        this.original = { username: u.username, email: u.email };
        this.form.patchValue({ username: u.username, email: u.email });
        this.cargando.set(false);
      },
      error: () => {
        this.original = { username: this.authService.nombreUsuario(), email: this.authService.emailUsuario() };
        this.form.patchValue(this.original);
        this.cargando.set(false);
      },
    });
  }

  guardar(): void {
    if (this.form.invalid) return;
    this.errorMsg.set(null);

    const { username, email, passwordActual, passwordNuevo } = this.form.value;

    if (passwordNuevo && !passwordActual) {
      this.errorMsg.set('Ingrese su contraseña actual para poder cambiarla.');
      return;
    }

    const payload: UpdateUserRequest = {};
    if (username && username !== this.original.username) payload.username = username;
    if (email && email !== this.original.email) payload.email = email;
    if (passwordNuevo) {
      payload.passwordNuevo = passwordNuevo;
      payload.passwordActual = passwordActual;
    }

    if (Object.keys(payload).length === 0) {
      this.errorMsg.set('No hay cambios para guardar.');
      return;
    }

    this.guardando.set(true);

    this.usuariosService.actualizarPerfil(payload).subscribe({
      next: (u) => {
        this.original = { username: u.username, email: u.email };
        this.authService.sincronizarSesion(u.username, u.email);
        this.form.patchValue({ username: u.username, email: u.email, passwordActual: '', passwordNuevo: '' });
        this.guardando.set(false);
        this.guardado.set(true);
        setTimeout(() => this.guardado.set(false), 3000);
      },
      error: (err) => {
        this.guardando.set(false);
        this.errorMsg.set(err?.error?.mensaje || 'No se pudo actualizar el perfil.');
      },
    });
  }
}
