import { Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard';
import { LicenciasComponent } from './pages/licencias/licencias';
import { ProveedoresComponent } from './pages/proveedores/proveedores';
import { AsignacionesComponent } from './pages/asignaciones/asignaciones';

export const routes: Routes = [
  { path: '', component: DashboardComponent },
  { path: 'licencias', component: LicenciasComponent },
  { path: 'proveedores', component: ProveedoresComponent },
  { path: 'asignaciones', component: AsignacionesComponent },
  { path: '**', redirectTo: '' },
];