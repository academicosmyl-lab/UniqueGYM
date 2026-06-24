import {
  Component,
  OnInit,
  inject,
  signal,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { catchError, of } from 'rxjs';
import {
  AnalyticsService,
  DashboardData,
  AlertaDashboard,
} from '../../core/services/analytics.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  private readonly svc = inject(AnalyticsService);

  loading = signal(true);
  error = signal<string | null>(null);
  data = signal<DashboardData | null>(null);

  readonly fechaActual = new Date().toLocaleDateString('es-CO', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  clientesActivos = computed(() => this.data()?.clientesActivos ?? 0);
  adherenciaPromedio = computed(() => this.data()?.adherenciaPromedio ?? 0);
  alertas = computed(() => this.data()?.alertas ?? []);
  totalAlertas = computed(() => this.alertas().length);

  adherenciaPct = computed(() => {
    const v = this.adherenciaPromedio();
    return Math.min(100, Math.max(0, v));
  });

  ngOnInit(): void {
    this.svc
      .getDashboard()
      .pipe(catchError(() => of(null)))
      .subscribe({
        next: (res) => {
          if (res) {
            this.data.set(res);
          } else {
            this.error.set('No se pudo cargar el dashboard. Verifica la conexión.');
          }
          this.loading.set(false);
        },
        error: () => {
          this.error.set('No se pudo cargar el dashboard. Verifica la conexión.');
          this.loading.set(false);
        },
      });
  }

  claseAlerta(tipo: AlertaDashboard['tipo']): string {
    switch (tipo) {
      case 'sin_actividad':
        return 'alerta-naranja';
      case 'baja_adherencia':
        return 'alerta-amarilla';
      case 'grasa_aumentando':
        return 'alerta-roja';
      default:
        return '';
    }
  }

  labelTipo(tipo: AlertaDashboard['tipo']): string {
    switch (tipo) {
      case 'sin_actividad':
        return 'Sin actividad';
      case 'baja_adherencia':
        return 'Baja adherencia';
      case 'grasa_aumentando':
        return '% Grasa aumentando';
      default:
        return tipo;
    }
  }

  formatNum(val: number, decimales = 1): string {
    return val.toFixed(decimales);
  }
}
