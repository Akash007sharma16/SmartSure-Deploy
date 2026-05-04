import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../core/services/admin.service';
import { User } from '../../core/models/auth.models';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.css']
})
export class UserManagementComponent implements OnInit {
  users: User[] = [];
  searchTerm = '';
  roleFilter = '';

  get filteredUsers(): User[] {
    return this.users.filter(u => {
      const matchSearch = !this.searchTerm ||
        u.fullName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchRole = !this.roleFilter || u.role === this.roleFilter;
      return matchSearch && matchRole;
    });
  }

  get activeCount():   number { return this.users.filter(u => u.isActive).length; }
  get inactiveCount(): number { return this.users.filter(u => !u.isActive).length; }
  get adminCount():    number { return this.users.filter(u => u.role === 'Admin').length; }
  get customerCount(): number { return this.users.filter(u => u.role === 'Customer').length; }

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.adminService.getAllUsers().subscribe(u => this.users = u);
  }

  getInitials(name: string): string {
    return name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'U';
  }

  toggleStatus(user: User): void {
    const action = user.isActive ? 'deactivate' : 'activate';
    if (!confirm(`Are you sure you want to ${action} ${user.fullName}?`)) return;
    this.adminService.updateUserStatus(user.id, !user.isActive).subscribe(updated => {
      const idx = this.users.findIndex(u => u.id === user.id);
      if (idx !== -1) this.users[idx] = updated;
    });
  }
}
