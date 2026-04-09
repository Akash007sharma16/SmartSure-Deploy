import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminDashboardComponent } from './dashboard/admin-dashboard.component';
import { ClaimReviewComponent } from './claim-review/claim-review.component';
import { PolicyManagementComponent } from './policy-management/policy-management.component';
import { UserManagementComponent } from './user-management/user-management.component';
import { adminGuard } from '../core/guards/auth.guard';

const routes: Routes = [
  { path: 'dashboard', component: AdminDashboardComponent, canActivate: [adminGuard] },
  { path: 'claims', component: ClaimReviewComponent, canActivate: [adminGuard] },
  { path: 'policies', component: PolicyManagementComponent, canActivate: [adminGuard] },
  { path: 'users', component: UserManagementComponent, canActivate: [adminGuard] },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminRoutingModule {}
