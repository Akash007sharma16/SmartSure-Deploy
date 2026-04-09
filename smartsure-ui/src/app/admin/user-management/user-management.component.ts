import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../core/services/admin.service';
import { User } from '../../core/models/auth.models';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div class="page-title">
          <h2>User Management</h2>
          <p>Manage platform users and their access</p>
        </div>
        <span class="badge badge-info" style="font-size:0.8rem; padding:0.4rem 0.75rem;">
          {{ users.length }} users
        </span>
      </div>

      <div *ngIf="users.length === 0" class="empty-state">
        <div class="empty-icon">👥</div>
        <h3>No users found</h3>
        <p>Users will appear here once they register.</p>
      </div>

      <!-- User Cards Grid -->
      <div class="user-grid" *ngIf="users.length > 0">
        <div *ngFor="let u of users" class="user-card">
          <div class="user-card-header">
            <div class="user-avatar-lg">{{ getInitials(u.fullName) }}</div>
            <div class="user-card-info">
              <div class="user-card-name">{{ u.fullName }}</div>
              <div class="user-card-email">{{ u.email }}</div>
            </div>
            <span class="badge" [class]="u.role === 'Admin' ? 'badge-admin' : 'badge-customer'">
              {{ u.role }}
            </span>
          </div>
          <div class="user-card-footer">
            <div class="user-status">
              <div class="status-dot" [class.active]="u.isActive" [class.inactive]="!u.isActive"></div>
              <span class="badge" [class]="u.isActive ? 'badge-active' : 'badge-inactive'">
                {{ u.isActive ? 'Active' : 'Inactive' }}
              </span>
            </div>
            <button class="btn btn-sm"
                    [class.btn-danger]="u.isActive"
                    [class.btn-success]="!u.isActive"
                    (click)="toggleStatus(u)">
              {{ u.isActive ? 'Deactivate' : 'Activate' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .user-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1rem;
    }
    .user-card {
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0,0,0,0.08);
      transition: all 0.2s;
    }
    .user-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.1); transform: translateY(-1px); }
    .user-card-header {
      display: flex;
      align-items: center;
      gap: 0.875rem;
      padding: 1.25rem;
    }
    .user-avatar-lg {
      width: 44px; height: 44px;
      border-radius: 50%;
      background: linear-gradient(135deg, #1e40af, #3b82f6);
      color: white;
      display: flex; align-items: center; justify-content: center;
      font-size: 0.9rem;
      font-weight: 800;
      flex-shrink: 0;
    }
    .user-card-info { flex: 1; min-width: 0; }
    .user-card-name { font-weight: 700; font-size: 0.9rem; color: #0f172a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .user-card-email { font-size: 0.75rem; color: #64748b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .user-card-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.875rem 1.25rem;
      background: #f8fafc;
      border-top: 1px solid #e2e8f0;
    }
    .user-status { display: flex; align-items: center; gap: 0.5rem; }
    .status-dot {
      width: 8px; height: 8px;
      border-radius: 50%;
    }
    .status-dot.active { background: #10b981; box-shadow: 0 0 0 2px rgba(16,185,129,0.2); }
    .status-dot.inactive { background: #ef4444; }
  `]
})
export class UserManagementComponent implements OnInit {
  users: User[] = [];

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.adminService.getAllUsers().subscribe(u => this.users = u);
  }

  getInitials(name: string): string {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  toggleStatus(user: User): void {
    this.adminService.updateUserStatus(user.id, !user.isActive).subscribe(updated => {
      const idx = this.users.findIndex(u => u.id === user.id);
      if (idx !== -1) this.users[idx] = updated;
    });
  }
}
