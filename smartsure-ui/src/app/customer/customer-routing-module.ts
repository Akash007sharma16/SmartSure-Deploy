import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CustomerDashboardComponent } from './dashboard/dashboard.component';
import { BuyPolicyComponent } from './buy-policy/buy-policy.component';
import { PoliciesComponent } from './policies/policies.component';
import { PolicyDetailComponent } from './policy-detail/policy-detail.component';
import { UploadDocumentsComponent } from './upload-documents/upload-documents.component';
import { customerGuard } from '../core/guards/auth.guard';

const routes: Routes = [
  { path: 'dashboard', component: CustomerDashboardComponent, canActivate: [customerGuard] },
  { path: 'buy-policy', component: BuyPolicyComponent, canActivate: [customerGuard] },
  { path: 'policies', component: PoliciesComponent, canActivate: [customerGuard] },
  { path: 'policies/:id', component: PolicyDetailComponent, canActivate: [customerGuard] },
  { path: 'upload-documents/:claimId', component: UploadDocumentsComponent, canActivate: [customerGuard] },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CustomerRoutingModule {}
