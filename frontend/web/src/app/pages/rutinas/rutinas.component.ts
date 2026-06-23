import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

export interface Routine {
  id: string;
  nombre: string;
  objetivo: string;
  semanas: number;
  es_plantilla: boolean;
  activa: boolean;
  cliente_id?: string | null;
  deleted_at?: string | null;
}

export interface Exercise {
  id: string;
  nombre: string;
  dificultad: string;
}

interface RoutineForm {
  nombre: string;
  objetivo: string;
  semanas: number;
  es_plantilla: boolean;
  cliente_id: string;
}

@Component({
  selector: 'app-rutinas',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './rutinas.component.html',
  styleUrl: './rutinas.component.scss',
})
export class RutinasComponent implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly API = 'http://localhost:3000/api/v1';

  rutinas = signal<Routine[]>([]);
  ejercicios = signal<Exercise[]>([]);
  loading = signal(false);
  showModal = signal(false);
  editingRoutine = signal<Routine | null>(null);
  errorMsg = signal<string | null>(null);

  form: RoutineForm = {
    nombre: '',
    objetivo: '',
    semanas: 4,
    es_plantilla: false,
    cliente_id: '',
  };

  get modalTitulo(): string {
    return this.editingRoutine() ? 'EDITAR RUTINA' : 'NUEVA RUTINA';
  }

  ngOnInit(): void {
    this.cargarRutinas();
    this.http
      .get<Exercise[]>(`${this.API}/exercises`)
      .pipe(catchError(() => of([])))
      .subscribe((lista) => this.ejercicios.set(lista));
  }

  cargarRutinas(): void {
    this.loading.set(true);
    this.http
      .get<Routine[]>(`${this.API}/routines`)
      .pipe(catchError(() => of([])))
      .subscribe({
        next: (lista) => {
          this.rutinas.set(lista);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
  }

  openCreate(): void {
    this.editingRoutine.set(null);
    this.form = { nombre: '', objetivo: '', semanas: 4, es_plantilla: false, cliente_id: '' };
    this.errorMsg.set(null);
    this.showModal.set(true);
  }

  openEdit(r: Routine): void {
    this.editingRoutine.set(r);
    this.form = {
      nombre: r.nombre,
      objetivo: r.objetivo,
      semanas: r.semanas,
      es_plantilla: r.es_plantilla,
      cliente_id: r.cliente_id ?? '',
    };
    this.errorMsg.set(null);
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
  }

  saveRoutine(): void {
    if (!this.form.nombre.trim()) {
      this.errorMsg.set('El nombre es requerido');
      return;
    }

    const payload = {
      nombre: this.form.nombre.trim(),
      objetivo: this.form.objetivo.trim(),
      semanas: this.form.semanas,
      es_plantilla: this.form.es_plantilla,
      cliente_id: this.form.cliente_id.trim() || null,
    };

    const editing = this.editingRoutine();
    const request$ = editing
      ? this.http.patch<Routine>(`${this.API}/routines/${editing.id}`, payload)
      : this.http.post<Routine>(`${this.API}/routines`, payload);

    request$.pipe(catchError((err) => {
      this.errorMsg.set(err?.error?.message ?? 'Error al guardar la rutina');
      return of(null);
    })).subscribe((result) => {
      if (result) {
        this.closeModal();
        this.cargarRutinas();
      }
    });
  }

  deleteRoutine(id: string): void {
    if (!confirm('¿Eliminar esta rutina? Esta acción no se puede deshacer.')) return;
    this.http
      .delete(`${this.API}/routines/${id}`)
      .pipe(catchError(() => of(null)))
      .subscribe(() => this.cargarRutinas());
  }
}
