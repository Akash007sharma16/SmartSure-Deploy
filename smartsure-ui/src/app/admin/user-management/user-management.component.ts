import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../core/services/admin.service';
import { User } from '../../core/models/auth.models';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule],
  template: `
  <div>
    <div class="ss-page-header mb-4">
      <div>
        <h2 class="ss-page-title">User Management</h2>
        <p class="ss-page-sub">Manage platform users and their access</p>
      </div>
      <span class="badge bg-primary rounded-pill px-3 py-2">{{ users.length }} users</span>
    </div>

    <div *ngIf="users.length === 0" class="ss-empty">
      <div class="ss-empty-icon">👥</div>
      <h3>No users found</h3>
      <p>Users will appear here once they register.</p>
    </div>

    <div class="row g-3" *ngIf="users.length > 0">
      <div class="col-md-6 col-xl-4" *ngFor="let u of users">
        <div class="ss-user-card">
          <div class="ss-uc-header">
            <div class="ss-uc-avatar">{{ getInitials(u.fullName) }}</div>
            <div class="ss-uc-info">
              <div class="ss-uc-name">{{ u.fullName }}</div>
              <div class="ss-uc-email">{{ u.email }}</div>
            </div>
            <span class="ss-badge" [ngClass]="u.role==='Admin'?'ss-badge-admin':'ss-badge-customer'">{{ u.role }}</span>
          </div>
          <div class="ss-uc-footer">
            <div class="d-flex align-items-center gap-2">
              <div class="ss-status-dot" [class.ss-dot-active]="u.isActive" [class.ss-dot-inactive]="!u.isActive"></div>
              <span class="ss-badge" [ngClass]="u.isActive?'ss-badge-active':'ss-badge-inactive'">{{ u.isActive ? 'Active' : 'Inactive' }}</span>
            </div>
            <button class="btn btn-sm" [class.btn-danger]="u.isActive" [class.btn-success]="!u.isActive" (click)="toggleStatus(u)">
              {{ u.isActive ? 'Deactivate' : 'Activate' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
  `,
  styles: [`
    .ss-page-header { display:flex; justify-content:space-between; align-items:center; gap:1rem; flex-wrap:wrap; }
    .ss-page-title { font-size:1.5rem; font-weight:900; color:#1e3a5f; margin:0 0 0.25rem; }
    .ss-page-sub { font-size:0.85rem; color:#64748b; margin:0; }
    .ss-user-card { background:white; border:1px solid #e2e8f0; border-radius:14px; overflow:hidden; transition:all 0.2s;
      &:hover { box-shadow:0 8px 24px rgba(30,58,95,0.1); transform:translateY(-2px); }
    }
    .ss-uc-header { display:flex; align-items:center; gap:0.875rem; padding:1.25rem; }
    .ss-uc-avatar { width:46px; height:46px; border-radius:50%; background:linear-gradient(135deg,#1e3a5f,#2563eb); color:white; display:flex; align-items:center; justify-content:center; font-size:0.9rem; font-weight:800; flex-shrink:0; }
    .ss-uc-info { flex:1; min-width:0; }
    .ss-uc-name { font-weight:700; font-size:0.9rem; color:#1e293b; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
    .ss-uc-email { font-size:0.75rem; color:#64748b; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
    .ss-uc-footer { display:flex; justify-content:space-between; align-items:center; padding:0.875rem 1.25rem; background:#f8fafc; border-top:1px solid #e2e8f0; }
    .ss-status-dot { width:8px; height:8px; border-radius:50%; }
    .ss-dot-active { background:#16a34a; box-shadow:0 0 0 2px rgba(22,163,74,0.2); }
    .ss-dot-inactive { background:#dc2626; }
    .ss-badge { display:inline-flex; align-items:center; padding:0.25rem 0.75rem; border-radius:100px; font-size:0.72rem; font-weight:700; }
    .ss-badge-active { background:#d1fae5; color:#065f46; }
    .ss-badge-inactive { background:#fee2e2; color:#991b1b; }
    .ss-badge-admin { background:#ede9fe; color:#5b21b6; }
    .ss-badge-customer { background:#dbeafe; color:#1e40af; }
    .ss-empty { text-align:center; padding:4rem 2rem; background:white; border:1px solid #e2e8f0; border-radius:14px; }
    .ss-empty-icon { font-size:3.5rem; margin-bottom:1rem; }
    h3 { font-size:1.1rem; font-weight:800; color:#1e3a5f; margin-bottom:0.5rem; }
    p { font-size:0.875rem; color:#64748b; margin:0; }
  `]
})
export class UserManagementComponent implements OnInit {
  users: User[] = [];
  constructor(private adminService: AdminService) {}
  ngOnInit(): void { this.adminService.getAllUsers().subscribe(u => this.users = u); }
  getInitials(name: string): string { return name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2) : 'U'; }
  toggleStatus(user: User): void {
    this.adminService.updateUserStatus(user.id, !user.isActive).subscribe(updated => {
      const idx = this.users.findIndex(u => u.id === user.id);
      if (idx !== -1) this.users[idx] = updated;
    });
  }
}
