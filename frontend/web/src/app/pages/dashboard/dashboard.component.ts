import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

interface KpiStats {
  clientes_activos: string;
  sesiones_hoy: string;
  adherencia: string;
  alertas: number;
}

interface WorkoutSession {
  id: string;
  cliente?: { nombres?: string; apellidos?: string };
  modulo?: string;
  fecha?: string;
  estado?: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly API = 'https://uniquegym.onrender.com/api/v1';

  loading = signal(false);
  stats = signal<KpiStats>({
    clientes_activos: '—',
    sesiones_hoy: '—',
    adherencia: '—',
    alertas: 0,
  });
  recentSessions = signal<WorkoutSession[]>([]);

  readonly fechaActual = new Date().toLocaleDateString('es-CO', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  ngOnInit(): void {
    this.loading.set(true);
    forkJoin({
      sessions: this.http
        .get<WorkoutSession[]>(`${this.API}/workout-sessions?limit=5`)
        .pipe(catchError(() => of([]))),
    }).subscribe({
      next: ({ sessions }) => {
        this.recentSessions.set(sessions ?? []);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }
}
