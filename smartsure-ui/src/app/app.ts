import { Component, OnInit } from '@angular/core';
import { RouterOutlet, RouterModule, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './core/services/auth.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterModule, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  layoutMode: 'app' | 'public' = 'public';
  sidebarCollapsed = false;
  currentPageName = 'Dashboard';

  private readonly publicRoutes = ['/', '/auth/login', '/auth/register'];

  private readonly pageNames: Record<string, string> = {
    '/customer/dashboard':  'Dashboard',
    '/customer/policies':   'My Policies',
    '/customer/buy-policy': 'Buy Policy',
    '/claims/initiate':     'File a Claim',
    '/claims/track':        'My Claims',
    '/admin/dashboard':     'Admin Dashboard',
    '/admin/claims':        'Claim Review',
    '/admin/policies':      'Policy Management',
    '/admin/users':         'User Management',
    '/reports':             'Reports & Analytics',
  };

  constructor(public authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe((e: any) => {
        const url = e.urlAfterRedirects || e.url;
        this.updateLayout(url);
        this.updatePageName(url);
      });

    this.updateLayout(this.router.url);
    this.updatePageName(this.router.url);
  }

  private updateLayout(url: string): void {
    const cleanUrl = url.split('?')[0].split('#')[0];
    const isPublic = this.publicRoutes.includes(cleanUrl) || cleanUrl.startsWith('/auth/');
    const isLoggedIn = this.authService.isLoggedIn();
    this.layoutMode = (isLoggedIn && !isPublic) ? 'app' : 'public';
  }

  private updatePageName(url: string): void {
    const cleanUrl = url.split('?')[0].split('#')[0];
    // Match exact or prefix (e.g. /customer/policies/4 → My Policies)
    const match = Object.keys(this.pageNames)
      .sort((a, b) => b.length - a.length)
      .find(k => cleanUrl === k || cleanUrl.startsWith(k + '/'));
    this.currentPageName = match ? this.pageNames[match] : 'SmartSure';
  }
}
