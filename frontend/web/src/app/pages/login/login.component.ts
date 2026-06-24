import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
})
export class LoginComponent implements OnInit, OnDestroy {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  email = '';
  password = '';
  loading = signal(false);
  error = signal('');
  showForm = signal(false);
  currentSlide = signal(0);

  readonly slides = [
    '/gym-1.jpg',
    '/gym-2.jpg',
    '/gym-3.jpg',
    '/gym-4.jpg',
    '/gym-5.jpg',
    '/gym-6.jpg',
  ];

  readonly INSTAGRAM = 'https://www.instagram.com/uniquegymoficial/';

  private slideTimer: ReturnType<typeof setInterval> | null = null;

  ngOnInit(): void {
    this.slideTimer = setInterval(() => {
      this.currentSlide.update(i => (i + 1) % this.slides.length);
    }, 5000);
  }

  ngOnDestroy(): void {
    if (this.slideTimer) clearInterval(this.slideTimer);
  }

  goToSlide(i: number): void {
    this.currentSlide.set(i);
  }

  abrirForm(): void {
    this.showForm.set(true);
  }

  volverLanding(): void {
    this.showForm.set(false);
    this.error.set('');
  }

  onSubmit(): void {
    if (!this.email || !this.password) return;
    this.loading.set(true);
    this.error.set('');
    this.auth.login(this.email, this.password).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: () => {
        this.error.set('Credenciales incorrectas. Intenta de nuevo.');
        this.loading.set(false);
      },
    });
  }
}
