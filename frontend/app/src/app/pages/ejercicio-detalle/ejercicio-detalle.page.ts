import { Component, OnInit, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { HttpClient } from '@angular/common/http';
import { RoutineExercise } from '../../core/models/rutina.model';

const API_URL = 'https://uniquegym.onrender.com/api/v1';
const SESSION_KEY = 'current_session_id';

export interface SerieRegistro {
  numero: number;
  peso: number | null;
  reps: number | null;
  rpe: number | null;
  completada: boolean;
  guardando: boolean;
}

@Component({
  selector: 'app-ejercicio-detalle',
  templateUrl: 'ejercicio-detalle.page.html',
  styleUrls: ['ejercicio-detalle.page.scss'],
  standalone: false,
})
export class EjercicioDetallePage implements OnInit {
  routineExercise = signal<RoutineExercise | null>(null);
  sessionId = signal<string | null>(null);
  series = signal<SerieRegistro[]>([]);
  videoUrl = signal<SafeResourceUrl | null>(null);
  finalizando = signal(false);
  errorMsg = signal<string | null>(null);
  iniciandoSesion = signal(false);

  readonly ejercicio = computed(() => this.routineExercise()?.exercise ?? null);
  readonly todasCompletadas = computed(() =>
    this.series().length > 0 && this.series().every((s) => s.completada)
  );

  constructor(
    private router: Router,
    private sanitizer: DomSanitizer,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    const state = history.state as {
      routineExercise?: RoutineExercise;
      sessionId?: string | null;
    };

    if (state?.routineExercise) {
      this.routineExercise.set(state.routineExercise);
      this._inicializarSeries(state.routineExercise.series);
      this._sanitizarVideo(state.routineExercise.exercise.video_url);
    }

    const sid = state?.sessionId ?? localStorage.getItem(SESSION_KEY);
    this.sessionId.set(sid ?? null);
  }

  private _inicializarSeries(cantidad: number): void {
    const lista: SerieRegistro[] = [];
    for (let i = 1; i <= cantidad; i++) {
      lista.push({ numero: i, peso: null, reps: null, rpe: null, completada: false, guardando: false });
    }
    this.series.set(lista);
  }

  private _sanitizarVideo(videoUrl?: string): void {
    if (!videoUrl) {
      this.videoUrl.set(null);
      return;
    }

    // Convierte URL de YouTube a embed
    const youtubeRegex = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = videoUrl.match(youtubeRegex);

    if (match) {
      const embedUrl = `https://www.youtube.com/embed/${match[1]}?rel=0&modestbranding=1`;
      this.videoUrl.set(this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl));
    } else {
      // URL directa de video
      this.videoUrl.set(this.sanitizer.bypassSecurityTrustResourceUrl(videoUrl));
    }
  }

  iniciarSesionDesdePantalla(): void {
    const re = this.routineExercise();
    if (!re || this.iniciandoSesion()) return;

    // Necesitamos el routine_day_id. Si llegamos aquí sin sesión, usamos el id del routine_exercise
    // como fallback — el flujo correcto es iniciar desde hoy.page
    this.iniciandoSesion.set(true);
    this.http
      .post<{ id: string }>(`${API_URL}/workout-sessions`, { routine_day_id: re.id })
      .subscribe({
        next: (session) => {
          localStorage.setItem(SESSION_KEY, session.id);
          this.sessionId.set(session.id);
          this.iniciandoSesion.set(false);
        },
        error: () => {
          this.iniciandoSesion.set(false);
          this.errorMsg.set('No se pudo iniciar el entrenamiento.');
        },
      });
  }

  guardarSerie(index: number): void {
    const sid = this.sessionId();
    const re = this.routineExercise();
    if (!sid || !re) {
      this.errorMsg.set('Debes iniciar el entrenamiento primero.');
      return;
    }

    const lista = [...this.series()];
    const serie = lista[index];

    if (serie.peso === null && serie.reps === null) {
      this.errorMsg.set('Ingresa al menos el peso o las repeticiones.');
      return;
    }

    this.errorMsg.set(null);
    lista[index] = { ...serie, guardando: true };
    this.series.set(lista);

    const payload = {
      exercise_id: re.exercise.id,
      numero_serie: serie.numero,
      peso: serie.peso,
      reps: serie.reps,
      rpe: serie.rpe,
    };

    this.http.post(`${API_URL}/workout-sessions/${sid}/sets`, payload).subscribe({
      next: () => {
        const actualizada = [...this.series()];
        actualizada[index] = { ...actualizada[index], completada: true, guardando: false };
        this.series.set(actualizada);
      },
      error: () => {
        const actualizada = [...this.series()];
        actualizada[index] = { ...actualizada[index], guardando: false };
        this.series.set(actualizada);
        this.errorMsg.set('No se pudo guardar la serie. Intenta de nuevo.');
      },
    });
  }

  finalizarEntrenamiento(): void {
    const sid = this.sessionId();
    if (!sid || this.finalizando()) return;

    this.finalizando.set(true);
    this.http.patch(`${API_URL}/workout-sessions/${sid}/complete`, {}).subscribe({
      next: () => {
        localStorage.removeItem(SESSION_KEY);
        this.finalizando.set(false);
        this.router.navigate(['/tabs/hoy']);
      },
      error: () => {
        this.finalizando.set(false);
        this.errorMsg.set('No se pudo finalizar el entrenamiento. Intenta de nuevo.');
      },
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

  trackBySerie(index: number): number {
    return index;
  }
}
