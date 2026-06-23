import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { EjercicioDetallePage } from './ejercicio-detalle.page';
import { EjercicioDetallePageRoutingModule } from './ejercicio-detalle-routing.module';

@NgModule({
  imports: [CommonModule, IonicModule, EjercicioDetallePageRoutingModule],
  declarations: [EjercicioDetallePage],
})
export class EjercicioDetallePageModule {}
