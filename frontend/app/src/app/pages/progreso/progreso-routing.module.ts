import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProgresoPage } from './progreso.page';

const routes: Routes = [{ path: '', component: ProgresoPage }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProgresoPageRoutingModule {}
