import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { forkJoin, of } from 'rxjs';

export interface Client {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
}

export interface RoutineDay {
  id: string;
  nombre: string;
  dia_semana: number | null;
  orden: number;
}

export interface Routine {
  id: string;
  nombre: string;
  objetivo: string | null;
  semanas: number;
  es_plantilla: boolean;
  activa: boolean;
  cliente_id?: string | null;
  days?: RoutineDay[];
}

interface CreateForm {
  nombre: string;
  objetivo: string;
  semanas: number;
  es_plantilla: boolean;
  cliente_id: string;
}

const DIAS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

@Component({
  selector: 'app-rutinas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './rutinas.component.html',
  styleUrl: './rutinas.component.scss',
})
export class RutinasComponent implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly API = 'https://uniquegym.onrender.com/api/v1';

  rutinas = signal<Routine[]>([]);
  clientes = signal<Client[]>([]);
  loading = signal(false);
  showModal = signal(false);
  guardando = signal(false);
  errorMsg = signal<string | null>(null);

  form: CreateForm = {
    nombre: '',
    objetivo: '',
    semanas: 4,
    es_plantilla: false,
    cliente_id: '',
  };

  clienteNombre(id: string | null | undefined): string {
    if (!id) return '—';
    const c = this.clientes().find(c => c.id === id);
    return c ? `${c.nombre} ${c.apellido}` : '—';
  }

  diasAsignados(days: RoutineDay[] | undefined): string {
    if (!days || days.length === 0) return '—';
    const withDay = days.filter(d => d.dia_semana !== null);
    if (withDay.length === 0) return `${days.length} día(s)`;
    return withDay.map(d => DIAS[d.dia_semana!]).join(', ');
  }

  ngOnInit(): void {
    this.loading.set(true);
    forkJoin({
      clientes: this.http.get<Client[]>(`${this.API}/users?role=CLIENTE`).pipe(catchError(() => of([]))),
      rutinas: this.http.get<any>(`${this.API}/routines`).pipe(catchError(() => of({ data: [] }))),
    }).subscribe(({ clientes, rutinas }) => {
      this.clientes.set(clientes);
      const lista = Array.isArray(rutinas) ? rutinas : (rutinas.data ?? []);
      this.rutinas.set(lista);
      this.loading.set(false);
    });
  }

  abrirConstructor(id: string): void {
    this.router.navigate(['/rutinas', id]);
  }

  openCreate(): void {
    this.form = { nombre: '', objetivo: '', semanas: 4, es_plantilla: false, cliente_id: '' };
    this.errorMsg.set(null);
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
  }

  crear(): void {
    if (!this.form.nombre.trim()) {
      this.errorMsg.set('El nombre es requerido');
      return;
    }
    this.guardando.set(true);
    this.errorMsg.set(null);

    const payload: any = {
      nombre: this.form.nombre.trim(),
      objetivo: this.form.objetivo.trim() || undefined,
      semanas: this.form.semanas,
      es_plantilla: this.form.es_plantilla,
    };
    if (this.form.cliente_id) payload.cliente_id = this.form.cliente_id;

    this.http.post<any>(`${this.API}/routines`, payload)
      .pipe(catchError(err => {
        this.errorMsg.set(err?.error?.message ?? 'Error al crear la rutina');
        this.guardando.set(false);
        return of(null);
      }))
      .subscribe(res => {
        if (!res) return;
        this.guardando.set(false);
        this.closeModal();
        const id = res.data?.id ?? res.id;
        this.router.navigate(['/rutinas', id]);
      });
  }

  eliminar(id: string): void {
    if (!confirm('¿Eliminar esta rutina?')) return;
    this.http.delete(`${this.API}/routines/${id}`)
      .pipe(catchError(() => of(null)))
      .subscribe(() => {
        this.rutinas.update(list => list.filter(r => r.id !== id));
      });
  }
}
