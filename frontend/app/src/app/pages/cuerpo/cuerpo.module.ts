import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { CuerpoPage } from './cuerpo.page';
import { CuerpoPageRoutingModule } from './cuerpo-routing.module';

@NgModule({
  imports: [CommonModule, ReactiveFormsModule, IonicModule, CuerpoPageRoutingModule],
  declarations: [CuerpoPage],
})
export class CuerpoPageModule {}
