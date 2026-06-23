import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

const routes: Routes = [
  {
    path: '',
    component: TabsPage,
    children: [
      {
        path: 'hoy',
        loadChildren: () =>
          import('../hoy/hoy.module').then((m) => m.HoyPageModule),
      },
      {
        path: 'cuerpo',
        loadChildren: () =>
          import('../cuerpo/cuerpo.module').then((m) => m.CuerpoPageModule),
      },
      {
        path: 'nutricion',
        loadChildren: () =>
          import('../nutricion/nutricion.module').then(
            (m) => m.NutricionPageModule
          ),
      },
      {
        path: 'progreso',
        loadChildren: () =>
          import('../progreso/progreso.module').then(
            (m) => m.ProgresoPageModule
          ),
      },
      {
        path: '',
        redirectTo: 'hoy',
        pathMatch: 'full',
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TabsPageRoutingModule {}
