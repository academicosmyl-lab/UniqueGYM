import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { forkJoin, of } from 'rxjs';

interface Exercise {
  id: string;
  nombre: string;
  dificultad: string;
  gif_url?: string | null;
}

interface RoutineExercise {
  id: string;
  exercise_id: string;
  exercise: Exercise;
  orden: number;
  series: number;
  reps_min: number | null;
  reps_max: number | null;
  descanso_seg: number;
  peso_sugerido: number | null;
  notas: string | null;
}

interface RoutineDay {
  id: string;
  nombre: string;
  dia_semana: number | null;
  orden: number;
  exercises: RoutineExercise[];
}

interface Rutina {
  id: string;
  nombre: string;
  objetivo: string | null;
  semanas: number;
  es_plantilla: boolean;
  activa: boolean;
  cliente_id: string | null;
  days: RoutineDay[];
}

interface Client {
  id: string;
  nombre: string;
  apellido: string;
}

interface DayExerciseForm {
  exercise: Exercise;
  series: number;
  reps_min: number;
  reps_max: number;
  descanso_seg: number;
  peso_sugerido: number | null;
  notas: string;
}

const DIAS_SEMANA = [
  { value: 0, label: 'Domingo' },
  { value: 1, label: 'Lunes' },
  { value: 2, label: 'Martes' },
  { value: 3, label: 'Miércoles' },
  { value: 4, label: 'Jueves' },
  { value: 5, label: 'Viernes' },
  { value: 6, label: 'Sábado' },
];

const DIAS_CORTO = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

@Component({
  selector: 'app-rutina-builder',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './rutina-builder.component.html',
  styleUrl: './rutina-builder.component.scss',
})
export class RutinaBuilderComponent implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly API = 'https://uniquegym.onrender.com/api/v1';

  readonly diasSemana = DIAS_SEMANA;
  readonly diasCorto = DIAS_CORTO;

  rutina = signal<Rutina | null>(null);
  ejerciciosDB = signal<Exercise[]>([]);
  clientes = signal<Client[]>([]);
  loading = signal(true);
  errorGlobal = signal<string | null>(null);

  // ── Modal: editar info de la rutina ──────────────────────────────────────
  showInfoModal = signal(false);
  infoForm = { nombre: '', objetivo: '', semanas: 4, cliente_id: '', activa: true };
  guardandoInfo = signal(false);
  errorInfo = signal<string | null>(null);

  // ── Modal: añadir día ────────────────────────────────────────────────────
  showDayModal = signal(false);
  dayForm = { nombre: '', dia_semana: 1 };
  dayExercises: DayExerciseForm[] = [];
  daySearchText = '';
  guardandoDia = signal(false);
  errorDia = signal<string | null>(null);

  // ── Modal: añadir ejercicio a un día existente ───────────────────────────
  showExModal = signal(false);
  targetDayId = signal<string | null>(null);
  exSearchText = '';
  exSelectedEx: Exercise | null = null;
  exForm = { series: 3, reps_min: 8, reps_max: 12, descanso_seg: 90, peso_sugerido: null as number | null, notas: '' };
  guardandoEx = signal(false);
  errorEx = signal<string | null>(null);

  // ── Computed ─────────────────────────────────────────────────────────────
  ejerciciosFiltrados = computed(() => {
    const q = this.daySearchText.toLowerCase();
    return q ? this.ejerciciosDB().filter(e => e.nombre.toLowerCase().includes(q)) : this.ejerciciosDB();
  });

  exFiltrados = computed(() => {
    const q = this.exSearchText.toLowerCase();
    return q ? this.ejerciciosDB().filter(e => e.nombre.toLowerCase().includes(q)) : this.ejerciciosDB();
  });

  clienteNombre(id: string | null): string {
    if (!id) return 'Sin cliente';
    const c = this.clientes().find(c => c.id === id);
    return c ? `${c.nombre} ${c.apellido}` : '—';
  }

  diaLabel(n: number | null): string {
    if (n === null) return '—';
    return DIAS_CORTO[n] ?? '—';
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    forkJoin({
      rutina: this.http.get<any>(`${this.API}/routines/${id}`).pipe(catchError(() => of(null))),
      ejercicios: this.http.get<any>(`${this.API}/exercises?limit=200`).pipe(catchError(() => of({ data: [] }))),
      clientes: this.http.get<Client[]>(`${this.API}/users?role=CLIENTE`).pipe(catchError(() => of([]))),
    }).subscribe(({ rutina, ejercicios, clientes }) => {
      if (!rutina) {
        this.errorGlobal.set('No se pudo cargar la rutina.');
      } else {
        const r: Rutina = rutina.data ?? rutina;
        r.days = r.days ?? [];
        this.rutina.set(r);
      }
      const lista = Array.isArray(ejercicios) ? ejercicios : (ejercicios.data ?? ejercicios);
      this.ejerciciosDB.set(Array.isArray(lista) ? lista : []);
      this.clientes.set(clientes);
      this.loading.set(false);
    });
  }

  // ── Editar info ───────────────────────────────────────────────────────────
  openInfoModal(): void {
    const r = this.rutina()!;
    this.infoForm = {
      nombre: r.nombre,
      objetivo: r.objetivo ?? '',
      semanas: r.semanas,
      cliente_id: r.cliente_id ?? '',
      activa: r.activa,
    };
    this.errorInfo.set(null);
    this.showInfoModal.set(true);
  }

  saveInfo(): void {
    if (!this.infoForm.nombre.trim()) { this.errorInfo.set('El nombre es requerido'); return; }
    this.guardandoInfo.set(true);
    const payload: any = {
      nombre: this.infoForm.nombre.trim(),
      objetivo: this.infoForm.objetivo.trim() || null,
      semanas: this.infoForm.semanas,
      activa: this.infoForm.activa,
      cliente_id: this.infoForm.cliente_id || null,
    };
    this.http.patch<any>(`${this.API}/routines/${this.rutina()!.id}`, payload)
      .pipe(catchError(err => {
        this.errorInfo.set(err?.error?.message ?? 'Error al guardar');
        this.guardandoInfo.set(false);
        return of(null);
      }))
      .subscribe(res => {
        if (!res) return;
        this.guardandoInfo.set(false);
        this.showInfoModal.set(false);
        this.rutina.update(r => ({ ...r!, ...payload }));
      });
  }

  // ── Añadir día ────────────────────────────────────────────────────────────
  openDayModal(): void {
    this.dayForm = { nombre: '', dia_semana: 1 };
    this.dayExercises = [];
    this.daySearchText = '';
    this.errorDia.set(null);
    this.showDayModal.set(true);
  }

  addExToDayForm(ex: Exercise): void {
    if (this.dayExercises.some(e => e.exercise.id === ex.id)) return;
    this.dayExercises.push({ exercise: ex, series: 3, reps_min: 8, reps_max: 12, descanso_seg: 90, peso_sugerido: null, notas: '' });
    this.daySearchText = '';
  }

  removeExFromDayForm(i: number): void {
    this.dayExercises.splice(i, 1);
  }

  saveDay(): void {
    if (!this.dayForm.nombre.trim()) { this.errorDia.set('El nombre del día es requerido'); return; }
    if (this.dayExercises.length === 0) { this.errorDia.set('Agrega al menos un ejercicio'); return; }
    this.guardandoDia.set(true);
    this.errorDia.set(null);

    const payload = {
      nombre: this.dayForm.nombre.trim(),
      dia_semana: this.dayForm.dia_semana,
      exercises: this.dayExercises.map((e, i) => ({
        exercise_id: e.exercise.id,
        orden: i + 1,
        series: e.series,
        reps_min: e.reps_min,
        reps_max: e.reps_max,
        descanso_seg: e.descanso_seg,
        peso_sugerido: e.peso_sugerido ?? undefined,
        notas: e.notas || undefined,
      })),
    };

    this.http.post<any>(`${this.API}/routines/${this.rutina()!.id}/days`, payload)
      .pipe(catchError(err => {
        this.errorDia.set(err?.error?.message ?? 'Error al guardar el día');
        this.guardandoDia.set(false);
        return of(null);
      }))
      .subscribe(res => {
        if (!res) return;
        this.guardandoDia.set(false);
        this.showDayModal.set(false);
        const newDay: RoutineDay = res.data ?? res;
        this.rutina.update(r => ({ ...r!, days: [...(r!.days ?? []), newDay] }));
      });
  }

  removeDay(dayId: string): void {
    if (!confirm('¿Eliminar este día y todos sus ejercicios?')) return;
    this.http.delete(`${this.API}/routines/${this.rutina()!.id}/days/${dayId}`)
      .pipe(catchError(() => of(null)))
      .subscribe(() => {
        this.rutina.update(r => ({ ...r!, days: r!.days.filter(d => d.id !== dayId) }));
      });
  }

  // ── Añadir ejercicio a día existente ─────────────────────────────────────
  openExModal(dayId: string): void {
    this.targetDayId.set(dayId);
    this.exSearchText = '';
    this.exSelectedEx = null;
    this.exForm = { series: 3, reps_min: 8, reps_max: 12, descanso_seg: 90, peso_sugerido: null, notas: '' };
    this.errorEx.set(null);
    this.showExModal.set(true);
  }

  selectEx(ex: Exercise): void {
    this.exSelectedEx = ex;
    this.exSearchText = '';
  }

  saveEx(): void {
    if (!this.exSelectedEx) { this.errorEx.set('Selecciona un ejercicio'); return; }
    this.guardandoEx.set(true);
    this.errorEx.set(null);

    const dayId = this.targetDayId()!;
    const payload = {
      exercise_id: this.exSelectedEx.id,
      series: this.exForm.series,
      reps_min: this.exForm.reps_min,
      reps_max: this.exForm.reps_max,
      descanso_seg: this.exForm.descanso_seg,
      peso_sugerido: this.exForm.peso_sugerido ?? undefined,
      notas: this.exForm.notas || undefined,
    };

    this.http.post<any>(`${this.API}/routines/${this.rutina()!.id}/days/${dayId}/exercises`, payload)
      .pipe(catchError(err => {
        this.errorEx.set(err?.error?.message ?? 'Error al añadir ejercicio');
        this.guardandoEx.set(false);
        return of(null);
      }))
      .subscribe(res => {
        if (!res) return;
        this.guardandoEx.set(false);
        this.showExModal.set(false);
        const newEx: RoutineExercise = res.data ?? res;
        newEx.exercise = this.exSelectedEx!;
        this.rutina.update(r => ({
          ...r!,
          days: r!.days.map(d => d.id === dayId
            ? { ...d, exercises: [...d.exercises, newEx] }
            : d
          ),
        }));
      });
  }

  removeEx(dayId: string, exId: string): void {
    if (!confirm('¿Quitar este ejercicio del día?')) return;
    this.http.delete(`${this.API}/routines/${this.rutina()!.id}/days/${dayId}/exercises/${exId}`)
      .pipe(catchError(() => of(null)))
      .subscribe(() => {
        this.rutina.update(r => ({
          ...r!,
          days: r!.days.map(d => d.id === dayId
            ? { ...d, exercises: d.exercises.filter(e => e.id !== exId) }
            : d
          ),
        }));
      });
  }

  volver(): void {
    this.router.navigate(['/rutinas']);
  }
}
