import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ComposicionHistorialPage } from './composicion-historial.page';
import { ComposicionHistorialPageRoutingModule } from './composicion-historial-routing.module';

@NgModule({
  imports: [CommonModule, IonicModule, ComposicionHistorialPageRoutingModule],
  declarations: [ComposicionHistorialPage],
})
export class ComposicionHistorialPageModule {}
