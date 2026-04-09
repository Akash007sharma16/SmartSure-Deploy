import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { InitiateClaimComponent } from './initiate-claim/initiate-claim.component';
import { ClaimTrackingComponent } from './claim-tracking/claim-tracking.component';
import { customerGuard } from '../core/guards/auth.guard';

const routes: Routes = [
  { path: 'initiate', component: InitiateClaimComponent, canActivate: [customerGuard] },
  { path: 'track', component: ClaimTrackingComponent, canActivate: [customerGuard] },
  { path: '', redirectTo: 'track', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ClaimsRoutingModule {}
