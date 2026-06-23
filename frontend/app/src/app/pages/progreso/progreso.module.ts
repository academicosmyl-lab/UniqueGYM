import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ProgresoPage } from './progreso.page';
import { ProgresoPageRoutingModule } from './progreso-routing.module';

@NgModule({
  imports: [CommonModule, IonicModule, ProgresoPageRoutingModule],
  declarations: [ProgresoPage],
})
export class ProgresoPageModule {}
