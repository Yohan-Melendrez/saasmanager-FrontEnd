import { Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard';
import { LicenciasComponent } from './pages/licencias/licencias';
import { ProveedoresComponent } from './pages/proveedores/proveedores';
import { AsignacionesComponent } from './pages/asignaciones/asignaciones';
import { LoginComponent } from './pages/login/login';
import { RegisterComponent } from './pages/register/register';
import { PerfilComponent } from './pages/perfil/perfil';
import { authGuard } from './core/guards/auth-guard';
import { adminGuard } from './core/guards/admin-guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: '', component: DashboardComponent, canActivate: [authGuard] },
  { path: 'licencias', component: LicenciasComponent, canActivate: [authGuard, adminGuard] },
  { path: 'proveedores', component: ProveedoresComponent, canActivate: [authGuard, adminGuard] },
  { path: 'asignaciones', component: AsignacionesComponent, canActivate: [authGuard] },
  { path: 'perfil', component: PerfilComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: '' },
];