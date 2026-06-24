import { Component, computed, inject, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss',
})
export class LayoutComponent {
  private readonly auth = inject(AuthService);

  userName = computed(() => this.auth.currentUser()?.nombres ?? '');
  pageTitle = signal('Dashboard');
  userRole = computed(() => this.auth.currentUser()?.role ?? '');

  esAdminOEntrenador = computed(() =>
    this.userRole() === 'ADMIN' || this.userRole() === 'ENTRENADOR'
  );

  esStaff = computed(() =>
    this.userRole() === 'ADMIN' ||
    this.userRole() === 'ENTRENADOR' ||
    this.userRole() === 'RECEPCION'
  );

  sidebarOpen = signal(false);

  toggleSidebar(): void {
    this.sidebarOpen.update(v => !v);
  }

  closeSidebar(): void {
    this.sidebarOpen.set(false);
  }

  logout(): void {
    this.auth.logout();
  }
}
