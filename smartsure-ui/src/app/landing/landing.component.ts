import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.scss'
})
export class LandingComponent implements OnInit {
  year = new Date().getFullYear();
  tab = 'auto';
  inp = '';

  constructor(private router: Router, private authService: AuthService) {}

  ngOnInit(): void {
    // Redirect logged-in users to their dashboard
    if (this.authService.isLoggedIn()) {
      const role = this.authService.getRole();
      this.router.navigate([role === 'Admin' ? '/admin/dashboard' : '/customer/dashboard']);
    }
  }

  get placeholder(): string {
    const map: Record<string, string> = {
      auto:   'Enter vehicle number  e.g. MH01AB1234',
      health: 'Enter your age',
      life:   'Enter desired coverage amount',
      travel: 'Enter destination country'
    };
    return map[this.tab] ?? '';
  }

  trustItems = [
    { num: '1 Cr+',  lbl: 'Happy Customers' },
    { num: '99.2%',  lbl: 'Claim Settlement' },
    { num: '50 L+',  lbl: 'Claims Settled' },
    { num: '4.8 ★',  lbl: 'App Rating' },
    { num: '24×7',   lbl: 'Customer Support' }
  ];

  products = [
    { icon: 'fa-solid fa-car',          name: 'Car Insurance',    price: '₹2,094/yr', bg: '#dbeafe', iconColor: '#2563eb' },
    { icon: 'fa-solid fa-motorcycle',   name: 'Bike Insurance',   price: '₹538/yr',  bg: '#fef3c7', iconColor: '#d97706' },
    { icon: 'fa-solid fa-heart-pulse',  name: 'Health Insurance', price: '₹3,999/yr', bg: '#dcfce7', iconColor: '#16a34a' },
    { icon: 'fa-solid fa-shield-halved',name: 'Life Insurance',   price: '₹799/yr',  bg: '#ede9fe', iconColor: '#7c3aed' },
    { icon: 'fa-solid fa-plane',        name: 'Travel Insurance', price: '₹299/trip', bg: '#cffafe', iconColor: '#0891b2' },
    { icon: 'fa-solid fa-house',        name: 'Home Insurance',   price: '₹1,499/yr', bg: '#fee2e2', iconColor: '#dc2626' }
  ];

  features = [
    { icon: 'fa-solid fa-bolt',         title: 'Instant Policy',      desc: 'Get your policy document in your inbox within 5 minutes. No paperwork, no waiting.',  color: 'f-blue'   },
    { icon: 'fa-solid fa-indian-rupee-sign', title: 'Lowest Premiums', desc: 'We compare 20+ insurers to get you the best price. Save up to 50% on your premium.', color: 'f-green'  },
    { icon: 'fa-solid fa-file-circle-check', title: 'Hassle-free Claims', desc: 'File a claim in 3 clicks. Our team handles everything and settles 99.2% of claims.', color: 'f-orange' },
    { icon: 'fa-solid fa-lock',         title: 'Secure & Trusted',    desc: 'Bank-grade 256-bit encryption. IRDAI registered. Your data is always safe with us.',   color: 'f-purple' },
    { icon: 'fa-solid fa-mobile-screen',title: 'Manage Anywhere',     desc: 'Access your policies, claims, and documents from any device, anytime, anywhere.',       color: 'f-teal'   },
    { icon: 'fa-solid fa-headset',      title: '24×7 Expert Support', desc: 'Talk to our insurance experts anytime. We\'re here to help you make the right choice.', color: 'f-red'    }
  ];

  steps = [
    { icon: 'fa-solid fa-pen-to-square', title: 'Enter Your Details',  desc: 'Tell us about yourself and what you want to insure. Takes less than 2 minutes.' },
    { icon: 'fa-solid fa-magnifying-glass', title: 'Compare & Choose', desc: 'We show you the best plans from top insurers. Pick the one that fits your needs.' },
    { icon: 'fa-solid fa-circle-check',  title: 'Pay & Get Protected', desc: 'Pay securely online. Your policy is active instantly. Download your document.' }
  ];

  goRegister(): void {
    this.router.navigate(['/auth/register']);
  }
}
