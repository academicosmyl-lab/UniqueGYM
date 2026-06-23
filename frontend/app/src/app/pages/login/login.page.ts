import { Component, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: 'login.page.html',
  styleUrls: ['login.page.scss'],
  standalone: false,
})
export class LoginPage {
  form: FormGroup;
  loading = signal(false);
  errorMsg = signal<string | null>(null);
  mostrarPassword = signal(false);

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  togglePassword(): void {
    this.mostrarPassword.update((v) => !v);
  }

  login(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMsg.set(null);

    const { email, password } = this.form.value as { email: string; password: string };

    this.authService.login(email, password).subscribe({
      next: (res) => {
        this.loading.set(false);
        const role = res.user.role;
        if (role === 'CLIENTE' || role === 'ADMIN' || role === 'ENTRENADOR' || role === 'RECEPCION') {
          this.router.navigate(['/tabs/hoy']);
        } else {
          this.router.navigate(['/tabs/hoy']);
        }
      },
      error: (err) => {
        this.loading.set(false);
        if (err?.status === 401) {
          this.errorMsg.set('Correo o contraseña incorrectos.');
        } else if (err?.status === 0) {
          this.errorMsg.set('No se puede conectar al servidor. Intenta de nuevo.');
        } else {
          this.errorMsg.set('Error al iniciar sesión. Intenta de nuevo.');
        }
      },
    });
  }
}
