import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="landing-page">

      <!-- Hero Section -->
      <section class="hero">
        <div class="hero-glow"></div>
        <div class="hero-content animate-fade-in-up">
          <div class="hero-badge">🛡️ Trusted by 10,000+ customers</div>
          <h1>Protect What<br><span class="hero-gradient">Matters Most</span></h1>
          <p class="hero-subtitle">
            SmartSure makes insurance simple — buy policies, file claims, and track everything in one modern platform.
          </p>
          <div class="hero-actions">
            <a routerLink="/auth/register" class="btn-hero-primary">Get Started Free →</a>
            <a routerLink="/auth/login" class="btn-hero-outline">Sign In</a>
          </div>
        </div>
        <div class="hero-visual animate-slide-in-right delay-2">
          <div class="hero-card">
            <div class="hero-card-header">
              <span class="hero-card-icon">🛡️</span>
              <div>
                <div class="hero-card-title">Health Insurance</div>
                <div class="hero-card-sub">Active · Expires Dec 2025</div>
              </div>
              <span class="badge badge-active">Active</span>
            </div>
            <div class="hero-card-stat">
              <div>
                <div class="hero-stat-label">Coverage</div>
                <div class="hero-stat-value">$500,000</div>
              </div>
              <div>
                <div class="hero-stat-label">Premium</div>
                <div class="hero-stat-value">$120/mo</div>
              </div>
              <div>
                <div class="hero-stat-label">Claims</div>
                <div class="hero-stat-value">2 filed</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Stats Bar -->
      <section class="stats-bar">
        <div class="stat-item">
          <div class="stat-num">10,000+</div>
          <div class="stat-desc">Policies Issued</div>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <div class="stat-num">99.8%</div>
          <div class="stat-desc">Claim Approval Rate</div>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <div class="stat-num">24/7</div>
          <div class="stat-desc">Customer Support</div>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <div class="stat-num">4.9★</div>
          <div class="stat-desc">Customer Rating</div>
        </div>
      </section>

      <!-- Features Section -->
      <section class="features">
        <div class="section-header">
          <h2>Everything you need, in one place</h2>
          <p>A complete insurance management platform built for the modern world.</p>
        </div>
        <div class="features-grid">
          <div class="feature-card animate-fade-in-up delay-1">
            <div class="feature-icon" style="background: linear-gradient(135deg, #1e40af, #3b82f6);">🛡️</div>
            <h3>Smart Policy Management</h3>
            <p>Choose from Health, Auto, Life, and more. Get instant premium calculations and activate coverage immediately.</p>
          </div>
          <div class="feature-card animate-fade-in-up delay-2">
            <div class="feature-icon" style="background: linear-gradient(135deg, #059669, #10b981);">📄</div>
            <h3>Seamless Claims Filing</h3>
            <p>Submit claims in minutes, upload supporting documents, and track real-time status updates from your dashboard.</p>
          </div>
          <div class="feature-card animate-fade-in-up delay-3">
            <div class="feature-icon" style="background: linear-gradient(135deg, #0891b2, #06b6d4);">📈</div>
            <h3>Powerful Analytics</h3>
            <p>Admins get full visibility with reports, dashboards, and insights across all policies, claims, and users.</p>
          </div>
        </div>
      </section>

      <!-- How It Works -->
      <section class="how-it-works">
        <div class="section-header">
          <h2>Get covered in 3 simple steps</h2>
          <p>From signup to active coverage in under 5 minutes.</p>
        </div>
        <div class="steps-grid">
          <div class="step-card">
            <div class="step-number">1</div>
            <h3>Create Your Account</h3>
            <p>Sign up in seconds with just your name, email, and password. No paperwork required.</p>
          </div>
          <div class="step-arrow">→</div>
          <div class="step-card">
            <div class="step-number">2</div>
            <h3>Choose a Policy</h3>
            <p>Browse policy types, enter your coverage amount, and get an instant premium estimate.</p>
          </div>
          <div class="step-arrow">→</div>
          <div class="step-card">
            <div class="step-number">3</div>
            <h3>Stay Protected</h3>
            <p>Your policy activates immediately. File claims anytime and track them in real time.</p>
          </div>
        </div>
      </section>

      <!-- Footer -->
      <footer class="landing-footer">
        <div class="footer-brand">
          <span class="footer-icon">🛡️</span>
          <span class="footer-name">SmartSure</span>
        </div>
        <p class="footer-copy">© {{ currentYear }} SmartSure Insurance. All rights reserved.</p>
        <div class="footer-links">
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Service</a>
          <a href="#">Contact</a>
        </div>
      </footer>
    </div>
  `,
  styles: [`
    .landing-page { min-height: 100vh; background: #f1f5f9; }

    /* Hero */
    .hero {
      background: linear-gradient(135deg, #0f172a 0%, #1e40af 50%, #0891b2 100%);
      padding: 5rem 4rem 4rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 3rem;
      min-height: 90vh;
      position: relative;
      overflow: hidden;
    }
    .hero-glow {
      position: absolute;
      top: -50%; left: -50%;
      width: 200%; height: 200%;
      background: radial-gradient(ellipse at 60% 40%, rgba(6,182,212,0.15) 0%, transparent 60%);
      animation: heroPulse 6s ease-in-out infinite;
      pointer-events: none;
    }
    @keyframes heroPulse { 0%,100% { opacity: 0.5; } 50% { opacity: 1; } }
    @keyframes heroFloat { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }

    .hero-content { flex: 1; max-width: 560px; position: relative; z-index: 1; }
    .hero-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      background: rgba(255,255,255,0.1);
      border: 1px solid rgba(255,255,255,0.2);
      color: rgba(255,255,255,0.9);
      padding: 0.4rem 1rem;
      border-radius: 100px;
      font-size: 0.8rem;
      font-weight: 600;
      margin-bottom: 1.5rem;
      backdrop-filter: blur(10px);
    }
    .hero h1 {
      font-size: 3.5rem;
      font-weight: 900;
      color: white;
      line-height: 1.1;
      margin-bottom: 1.25rem;
    }
    .hero-gradient {
      background: linear-gradient(90deg, #06b6d4, #a78bfa);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    .hero-subtitle {
      font-size: 1.1rem;
      color: rgba(255,255,255,0.75);
      margin-bottom: 2.5rem;
      line-height: 1.7;
    }
    .hero-actions { display: flex; gap: 1rem; flex-wrap: wrap; }
    .btn-hero-primary {
      background: white;
      color: #1e40af;
      padding: 0.875rem 2rem;
      border-radius: 8px;
      font-weight: 700;
      font-size: 0.95rem;
      text-decoration: none;
      transition: all 0.2s;
      box-shadow: 0 4px 14px rgba(0,0,0,0.2);
    }
    .btn-hero-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(0,0,0,0.25); color: #1e3a8a; }
    .btn-hero-outline {
      background: transparent;
      color: white;
      padding: 0.875rem 2rem;
      border-radius: 8px;
      font-weight: 700;
      font-size: 0.95rem;
      text-decoration: none;
      border: 2px solid rgba(255,255,255,0.4);
      transition: all 0.2s;
    }
    .btn-hero-outline:hover { background: rgba(255,255,255,0.1); border-color: white; }

    .hero-visual {
      flex: 0 0 380px;
      position: relative;
      z-index: 1;
      animation: heroFloat 4s ease-in-out infinite;
    }
    .hero-card {
      background: rgba(255,255,255,0.95);
      border-radius: 16px;
      padding: 1.5rem;
      box-shadow: 0 20px 40px rgba(0,0,0,0.3);
      backdrop-filter: blur(20px);
    }
    .hero-card-header { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1.25rem; }
    .hero-card-icon { font-size: 1.75rem; }
    .hero-card-title { font-weight: 700; font-size: 0.95rem; color: #0f172a; }
    .hero-card-sub { font-size: 0.75rem; color: #64748b; }
    .hero-card-stat { display: flex; justify-content: space-between; padding-top: 1rem; border-top: 1px solid #e2e8f0; }
    .hero-stat-label { font-size: 0.7rem; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }
    .hero-stat-value { font-size: 1rem; font-weight: 800; color: #0f172a; margin-top: 0.2rem; }

    /* Stats Bar */
    .stats-bar {
      background: white;
      border-bottom: 1px solid #e2e8f0;
      padding: 2rem 4rem;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 3rem;
    }
    .stat-item { text-align: center; }
    .stat-num { font-size: 1.75rem; font-weight: 900; color: #1e40af; }
    .stat-desc { font-size: 0.8rem; color: #64748b; font-weight: 500; margin-top: 0.2rem; }
    .stat-divider { width: 1px; height: 40px; background: #e2e8f0; }

    /* Features */
    .features { padding: 5rem 4rem; background: #f1f5f9; }
    .section-header { text-align: center; margin-bottom: 3rem; }
    .section-header h2 { font-size: 2rem; font-weight: 800; color: #0f172a; margin-bottom: 0.75rem; }
    .section-header p { color: #64748b; font-size: 1rem; }
    .features-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; max-width: 1100px; margin: 0 auto; }
    .feature-card {
      background: white;
      border-radius: 12px;
      padding: 2rem;
      border: 1px solid #e2e8f0;
      box-shadow: 0 1px 3px rgba(0,0,0,0.08);
      transition: all 0.2s;
    }
    .feature-card:hover { box-shadow: 0 10px 25px rgba(0,0,0,0.1); transform: translateY(-3px); }
    .feature-icon {
      width: 52px; height: 52px;
      border-radius: 12px;
      display: flex; align-items: center; justify-content: center;
      font-size: 1.4rem;
      margin-bottom: 1.25rem;
    }
    .feature-card h3 { font-size: 1.05rem; font-weight: 700; color: #0f172a; margin-bottom: 0.75rem; }
    .feature-card p { font-size: 0.875rem; color: #64748b; line-height: 1.7; }

    /* How It Works */
    .how-it-works { padding: 5rem 4rem; background: white; }
    .steps-grid { display: flex; align-items: center; justify-content: center; gap: 1rem; max-width: 900px; margin: 0 auto; }
    .step-card {
      flex: 1;
      background: #f8fafc;
      border-radius: 12px;
      padding: 2rem;
      border: 1px solid #e2e8f0;
      text-align: center;
    }
    .step-number {
      width: 48px; height: 48px;
      background: linear-gradient(135deg, #1e40af, #3b82f6);
      color: white;
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 1.25rem;
      font-weight: 800;
      margin: 0 auto 1rem;
    }
    .step-card h3 { font-size: 1rem; font-weight: 700; color: #0f172a; margin-bottom: 0.5rem; }
    .step-card p { font-size: 0.85rem; color: #64748b; line-height: 1.6; }
    .step-arrow { font-size: 1.5rem; color: #94a3b8; flex-shrink: 0; }

    /* Footer */
    .landing-footer {
      background: #0f172a;
      padding: 2.5rem 4rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 1rem;
    }
    .footer-brand { display: flex; align-items: center; gap: 0.5rem; }
    .footer-icon { font-size: 1.25rem; }
    .footer-name { font-size: 1.1rem; font-weight: 800; color: white; }
    .footer-copy { color: #64748b; font-size: 0.8rem; }
    .footer-links { display: flex; gap: 1.5rem; }
    .footer-links a { color: #64748b; font-size: 0.8rem; text-decoration: none; }
    .footer-links a:hover { color: white; }

    @media (max-width: 1024px) {
      .hero { flex-direction: column; padding: 4rem 2rem; min-height: auto; }
      .hero-visual { flex: none; width: 100%; max-width: 400px; animation: none; }
      .features-grid { grid-template-columns: 1fr; }
      .steps-grid { flex-direction: column; }
      .step-arrow { transform: rotate(90deg); }
    }
    @media (max-width: 768px) {
      .stats-bar { flex-wrap: wrap; gap: 1.5rem; padding: 2rem; }
      .stat-divider { display: none; }
      .features, .how-it-works { padding: 3rem 1.5rem; }
      .landing-footer { flex-direction: column; text-align: center; padding: 2rem; }
    }
  `]
})
export class LandingComponent {
  currentYear = new Date().getFullYear();
}
