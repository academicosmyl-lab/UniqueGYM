import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { LoginResponse, StoredUser } from '../models/auth.model';

const API_URL = 'http://localhost:3000/api/v1';
const STORAGE_KEY = 'ug_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private _currentUser = signal<StoredUser | null>(this._loadFromStorage());

  readonly isLoggedIn = computed(() => !!this._currentUser());

  constructor(private http: HttpClient, private router: Router) {}

  private _loadFromStorage(): StoredUser | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as StoredUser) : null;
    } catch {
      return null;
    }
  }

  currentUser(): StoredUser | null {
    return this._currentUser();
  }

  getToken(): string | null {
    return this._currentUser()?.access_token ?? null;
  }

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${API_URL}/auth/login`, { email, password })
      .pipe(
        tap((res) => {
          // Decodifica el payload del JWT para extraer gymId
          const gymId = this._decodeGymId(res.access_token);
          const stored: StoredUser = {
            id: res.user.id,
            nombres: res.user.nombres,
            role: res.user.role,
            gymId,
            access_token: res.access_token,
          };
          localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
          this._currentUser.set(stored);
        })
      );
  }

  logout(): void {
    localStorage.removeItem(STORAGE_KEY);
    this._currentUser.set(null);
    this.router.navigate(['/login']);
  }

  private _decodeGymId(token: string): string {
    try {
      const payload = token.split('.')[1];
      const decoded = JSON.parse(atob(payload));
      return decoded.gymId ?? '';
    } catch {
      return '';
    }
  }
}
