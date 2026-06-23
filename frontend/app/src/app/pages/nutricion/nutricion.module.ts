import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { NutricionPage } from './nutricion.page';
import { NutricionPageRoutingModule } from './nutricion-routing.module';

@NgModule({
  imports: [CommonModule, IonicModule, NutricionPageRoutingModule],
  declarations: [NutricionPage],
})
export class NutricionPageModule {}
