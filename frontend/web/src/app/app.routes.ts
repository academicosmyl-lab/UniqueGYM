import { Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./pages/dashboard/dashboard.component').then(
            (m) => m.DashboardComponent
          ),
      },
      {
        path: 'clientes',
        loadComponent: () =>
          import('./pages/clientes/clientes.component').then(
            (m) => m.ClientesComponent
          ),
      },
      {
        path: 'rutinas',
        loadComponent: () =>
          import('./pages/rutinas/rutinas.component').then(
            (m) => m.RutinasComponent
          ),
      },
      {
        path: 'ejercicios',
        loadComponent: () =>
          import('./pages/ejercicios/ejercicios.component').then(
            (m) => m.EjerciciosComponent
          ),
      },
      {
        path: 'composicion',
        canActivate: [roleGuard(['ADMIN', 'ENTRENADOR'])],
        loadComponent: () =>
          import('./features/composicion/composicion.component').then(
            (m) => m.ComposicionComponent
          ),
      },
    ],
  },
  { path: '**', redirectTo: 'login' },
];
