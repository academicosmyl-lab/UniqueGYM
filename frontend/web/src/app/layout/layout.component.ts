import { Component, computed, inject, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss',
})
export class LayoutComponent {
  private readonly auth = inject(AuthService);

  userName = computed(() => this.auth.currentUser()?.nombres ?? '');
  pageTitle = signal('Dashboard');

  logout(): void {
    this.auth.logout();
  }
}
