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

  // Routes that use the full-viewport public layout (no navbar, no main-content wrapper)
  private readonly publicRoutes = ['/', '/auth/login', '/auth/register'];

  constructor(public authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe((e: any) => {
        this.updateLayout(e.urlAfterRedirects || e.url);
      });

    // Set initial layout
    this.updateLayout(this.router.url);
  }

  private updateLayout(url: string): void {
    const cleanUrl = url.split('?')[0].split('#')[0];
    const isPublic = this.publicRoutes.includes(cleanUrl) || cleanUrl.startsWith('/auth/');
    const isLoggedIn = this.authService.isLoggedIn();

    if (isLoggedIn && !isPublic) {
      this.layoutMode = 'app';
    } else {
      this.layoutMode = 'public';
    }
  }
}
