import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EjercicioDetallePage } from './ejercicio-detalle.page';

const routes: Routes = [{ path: '', component: EjercicioDetallePage }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EjercicioDetallePageRoutingModule {}
