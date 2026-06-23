import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { LoginResponse, StoredUser } from '../models/auth.model';

const STORAGE_KEY = 'ug_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  private readonly API = 'http://localhost:3000/api/v1';

  currentUser = signal<StoredUser | null>(this.loadUser());
  isLoggedIn = computed(() => !!this.currentUser());

  login(email: string, password: string) {
    return this.http
      .post<LoginResponse>(`${this.API}/auth/login`, { email, password })
      .pipe(
        tap((res) => {
          const stored: StoredUser = {
            id: res.user.id,
            nombres: res.user.nombres,
            role: res.user.role as StoredUser['role'],
            gymId: '',
            access_token: res.access_token,
          };
          localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
          this.currentUser.set(stored);
        })
      );
  }

  logout(): void {
    localStorage.removeItem(STORAGE_KEY);
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return this.currentUser()?.access_token ?? null;
  }

  loadUser(): StoredUser | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as StoredUser) : null;
    } catch {
      return null;
    }
  }
}
