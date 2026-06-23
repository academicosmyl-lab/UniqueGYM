import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { HoyPage } from './hoy.page';
import { HoyPageRoutingModule } from './hoy-routing.module';

@NgModule({
  imports: [CommonModule, IonicModule, HoyPageRoutingModule],
  declarations: [HoyPage],
})
export class HoyPageModule {}
