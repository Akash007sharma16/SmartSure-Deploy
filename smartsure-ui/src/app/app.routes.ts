import { Routes } from '@angular/router';
import { LandingComponent } from './landing/landing.component';

export const routes: Routes = [
  { path: '', component: LandingComponent },
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth-module').then(m => m.AuthModule)
  },
  {
    path: 'customer',
    loadChildren: () => import('./customer/customer-module').then(m => m.CustomerModule)
  },
  {
    path: 'claims',
    loadChildren: () => import('./claims/claims-module').then(m => m.ClaimsModule)
  },
  {
    path: 'admin',
    loadChildren: () => import('./admin/admin-module').then(m => m.AdminModule)
  },
  {
    path: 'reports',
    loadChildren: () => import('./reports/reports-module').then(m => m.ReportsModule)
  }
];
