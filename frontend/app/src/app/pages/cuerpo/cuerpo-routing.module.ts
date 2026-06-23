import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CuerpoPage } from './cuerpo.page';

const routes: Routes = [{ path: '', component: CuerpoPage }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CuerpoPageRoutingModule {}
