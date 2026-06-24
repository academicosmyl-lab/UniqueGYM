import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpParams } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { forkJoin, of } from 'rxjs';

export interface Equipment {
  id: string;
  nombre: string;
}

export interface MuscleGroup {
  id: string;
  nombre: string;
}

export interface Exercise {
  id: string;
  nombre: string;
  descripcion?: string;
  instrucciones?: string;
  video_url?: string;
  thumbnail_url?: string;
  gif_url?: string;
  dificultad: 'PRINCIPIANTE' | 'INTERMEDIO' | 'AVANZADO';
  es_publico: boolean;
  equipment?: Equipment | null;
}

interface Filtros {
  search: string;
  muscle_id: string;
  dificultad: string;
  page: number;
  limit: number;
}

interface EjercicioForm {
  nombre: string;
  descripcion: string;
  instrucciones: string;
  gif_url: string;
  video_url: string;
  thumbnail_url: string;
  equipment_id: string;
  dificultad: string;
  es_publico: boolean;
}

interface PagedResponse {
  data: Exercise[];
  total: number;
}

@Component({
  selector: 'app-ejercicios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ejercicios.component.html',
  styleUrl: './ejercicios.component.scss',
})
export class EjerciciosComponent implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly API = 'https://uniquegym.onrender.com/api/v1';

  ejercicios = signal<Exercise[]>([]);
  musculos = signal<MuscleGroup[]>([]);
  equipment = signal<Equipment[]>([]);
  loading = signal(false);
  showModal = signal(false);
  editingEjercicio = signal<Exercise | null>(null);
  total = signal(0);
  errorMsg = signal<string | null>(null);

  filtros = signal<Filtros>({
    search: '',
    muscle_id: '',
    dificultad: '',
    page: 1,
    limit: 20,
  });

  totalPaginas = computed(() => Math.max(1, Math.ceil(this.total() / this.filtros().limit)));

  form: EjercicioForm = {
    nombre: '',
    descripcion: '',
    instrucciones: '',
    video_url: '',
    thumbnail_url: '',
    equipment_id: '',
    dificultad: 'PRINCIPIANTE',
    es_publico: true,
  };

  get modalTitulo(): string {
    return this.editingEjercicio() ? 'EDITAR EJERCICIO' : 'NUEVO EJERCICIO';
  }

  ngOnInit(): void {
    forkJoin({
      musculos: this.http.get<MuscleGroup[]>(`${this.API}/exercises/muscles`).pipe(catchError(() => of([]))),
      equipment: this.http.get<Equipment[]>(`${this.API}/exercises/equipment`).pipe(catchError(() => of([]))),
    }).subscribe(({ musculos, equipment }) => {
      this.musculos.set(musculos);
      this.equipment.set(equipment);
    });
    this.cargarEjercicios();
  }

  cargarEjercicios(): void {
    this.loading.set(true);
    const f = this.filtros();

    let params = new HttpParams()
      .set('page', String(f.page))
      .set('limit', String(f.limit));
    if (f.search) params = params.set('search', f.search);
    if (f.muscle_id) params = params.set('muscle_id', f.muscle_id);
    if (f.dificultad) params = params.set('dificultad', f.dificultad);

    this.http
      .get<Exercise[] | PagedResponse>(`${this.API}/exercises`, { params })
      .pipe(catchError(() => of({ data: [], total: 0 })))
      .subscribe({
        next: (res) => {
          if (Array.isArray(res)) {
            this.ejercicios.set(res);
            this.total.set(res.length);
          } else {
            this.ejercicios.set((res as PagedResponse).data ?? []);
            this.total.set((res as PagedResponse).total ?? 0);
          }
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
  }

  filtrar(campo: keyof Filtros, valor: string): void {
    this.filtros.update((f) => ({ ...f, [campo]: valor, page: 1 }));
    this.cargarEjercicios();
  }

  paginaSiguiente(): void {
    if (this.filtros().page < this.totalPaginas()) {
      this.filtros.update((f) => ({ ...f, page: f.page + 1 }));
      this.cargarEjercicios();
    }
  }

  paginaAnterior(): void {
    if (this.filtros().page > 1) {
      this.filtros.update((f) => ({ ...f, page: f.page - 1 }));
      this.cargarEjercicios();
    }
  }

  openCreate(): void {
    this.editingEjercicio.set(null);
    this.form = {
      nombre: '', descripcion: '', instrucciones: '',
      gif_url: '', video_url: '', thumbnail_url: '',
      equipment_id: '', dificultad: 'PRINCIPIANTE', es_publico: true,
    };
    this.errorMsg.set(null);
    this.showModal.set(true);
  }

  openEdit(e: Exercise): void {
    this.editingEjercicio.set(e);
    this.form = {
      nombre: e.nombre,
      descripcion: e.descripcion ?? '',
      instrucciones: e.instrucciones ?? '',
      gif_url: e.gif_url ?? '',
      video_url: e.video_url ?? '',
      thumbnail_url: e.thumbnail_url ?? '',
      equipment_id: e.equipment?.id ?? '',
      dificultad: e.dificultad,
      es_publico: e.es_publico,
    };
    this.errorMsg.set(null);
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
  }

  saveEjercicio(): void {
    if (!this.form.nombre.trim()) {
      this.errorMsg.set('El nombre es requerido');
      return;
    }

    const payload = {
      nombre: this.form.nombre.trim(),
      descripcion: this.form.descripcion.trim() || null,
      instrucciones: this.form.instrucciones.trim() || null,
      video_url: this.form.video_url.trim() || null,
      thumbnail_url: this.form.thumbnail_url.trim() || null,
      equipment_id: this.form.equipment_id || null,
      dificultad: this.form.dificultad,
      es_publico: this.form.es_publico,
    };

    const editing = this.editingEjercicio();
    const request$ = editing
      ? this.http.patch<Exercise>(`${this.API}/exercises/${editing.id}`, payload)
      : this.http.post<Exercise>(`${this.API}/exercises`, payload);

    request$.pipe(catchError((err) => {
      this.errorMsg.set(err?.error?.message ?? 'Error al guardar el ejercicio');
      return of(null);
    })).subscribe((result) => {
      if (result) {
        this.closeModal();
        this.cargarEjercicios();
      }
    });
  }

  deleteEjercicio(id: string): void {
    if (!confirm('¿Eliminar este ejercicio? Esta acción no se puede deshacer.')) return;
    this.http
      .delete(`${this.API}/exercises/${id}`)
      .pipe(catchError(() => of(null)))
      .subscribe(() => this.cargarEjercicios());
  }

  badgeDificultad(dificultad: string): string {
    const map: Record<string, string> = {
      PRINCIPIANTE: 'ug-badge-info',
      INTERMEDIO: 'ug-badge-warn',
      AVANZADO: 'ug-badge-err',
    };
    return map[dificultad] ?? 'ug-badge-info';
  }
}
