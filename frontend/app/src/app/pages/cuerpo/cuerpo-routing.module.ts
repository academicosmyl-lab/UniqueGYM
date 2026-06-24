import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CuerpoPage } from './cuerpo.page';

const routes: Routes = [
  {
    path: '',
    component: CuerpoPage,
  },
  {
    path: 'historial',
    loadChildren: () =>
      import('../composicion-historial/composicion-historial.module').then(
        (m) => m.ComposicionHistorialPageModule
      ),
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CuerpoPageRoutingModule {}
