import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReportsComponent } from './reports.component';
import { adminGuard } from '../core/guards/auth.guard';

const routes: Routes = [
  { path: '', component: ReportsComponent, canActivate: [adminGuard] }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ReportsRoutingModule {}
