import { Component, OnInit, signal, computed } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { RoutineDay, RoutineExercise } from '../../core/models/rutina.model';

const API_URL = 'http://localhost:3000/api/v1';
const DIAS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const SESSION_KEY = 'current_session_id';

@Component({
  selector: 'app-hoy',
  templateUrl: 'hoy.page.html',
  styleUrls: ['hoy.page.scss'],
  standalone: false,
})
export class HoyPage implements OnInit {
  loading = signal(true);
  routineDay = signal<RoutineDay | null>(null);
  errorMsg = signal<string | null>(null);
  iniciando = signal(false);

  readonly diaTexto = computed(() => DIAS[new Date().getDay()]);

  readonly totalSeries = computed(() => {
    const rd = this.routineDay();
    if (!rd) return 0;
    return rd.routine_exercises.reduce((acc, re) => acc + re.series, 0);
  });

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    this.cargarRutina();
  }

  ionViewWillEnter(): void {
    this.cargarRutina();
  }

  cargarRutina(): void {
    this.loading.set(true);
    this.errorMsg.set(null);

    this.http.get<RoutineDay | null>(`${API_URL}/routines/today`).subscribe({
      next: (data) => {
        this.routineDay.set(data);
        this.loading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        if (err.status === 404) {
          this.routineDay.set(null);
        } else {
          this.errorMsg.set('No se pudo cargar la rutina. Intenta de nuevo.');
        }
      },
    });
  }

  iniciarEntrenamiento(): void {
    const rd = this.routineDay();
    if (!rd || this.iniciando()) return;

    this.iniciando.set(true);

    this.http
      .post<{ id: string }>(`${API_URL}/workout-sessions`, { routine_day_id: rd.id })
      .subscribe({
        next: (session) => {
          localStorage.setItem(SESSION_KEY, session.id);
          this.iniciando.set(false);
          // Navega al primer ejercicio si existe
          if (rd.routine_exercises.length > 0) {
            this.navigateToEjercicio(rd.routine_exercises[0]);
          }
        },
        error: () => {
          this.iniciando.set(false);
          this.errorMsg.set('No se pudo iniciar el entrenamiento. Intenta de nuevo.');
        },
      });
  }

  navigateToEjercicio(routineExercise: RoutineExercise): void {
    const sessionId = localStorage.getItem(SESSION_KEY);
    this.router.navigate(['/ejercicio', routineExercise.exercise.id], {
      state: { routineExercise, sessionId },
    });
  }

  badgeDificultad(dificultad: string): string {
    const map: Record<string, string> = {
      PRINCIPIANTE: 'saludable',
      INTERMEDIO: 'advertencia',
      AVANZADO: 'fuera',
    };
    return map[dificultad] ?? 'saludable';
  }

  labelDificultad(dificultad: string): string {
    const map: Record<string, string> = {
      PRINCIPIANTE: 'Principiante',
      INTERMEDIO: 'Intermedio',
      AVANZADO: 'Avanzado',
    };
    return map[dificultad] ?? dificultad;
  }
}
