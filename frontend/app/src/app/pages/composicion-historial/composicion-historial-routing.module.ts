import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ComposicionHistorialPage } from './composicion-historial.page';

const routes: Routes = [{ path: '', component: ComposicionHistorialPage }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ComposicionHistorialPageRoutingModule {}
