import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { EjercicioDetallePage } from './ejercicio-detalle.page';
import { EjercicioDetallePageRoutingModule } from './ejercicio-detalle-routing.module';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule,
    EjercicioDetallePageRoutingModule,
  ],
  declarations: [EjercicioDetallePage],
})
export class EjercicioDetallePageModule {}
