import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { CuerpoPage } from './cuerpo.page';
import { CuerpoPageRoutingModule } from './cuerpo-routing.module';

@NgModule({
  imports: [CommonModule, IonicModule, CuerpoPageRoutingModule],
  declarations: [CuerpoPage],
})
export class CuerpoPageModule {}
