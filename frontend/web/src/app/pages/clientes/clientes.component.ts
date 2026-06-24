import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';

export interface Cliente {
  id: string;
  nombres: string;
  apellidos: string;
  email: string;
  activo: boolean;
  objetivo: 'PERDER_GRASA' | 'GANAR_MUSCULO' | 'MANTENER' | 'RECOMPOSICION' | string;
  avatar_url?: string;
}

export interface Routine {
  id: string;
  nombre: string;
  objetivo: string;
  semanas: number;
}

export interface NuevoCliente {
  nombres: string;
  apellidos: string;
  email: string;
  password: string;
  objetivo: string;
}

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './clientes.component.html',
  styleUrl: './clientes.component.scss',
})
export class ClientesComponent implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly API = 'https://uniquegym.onrender.com/api/v1';

  clientes = signal<Cliente[]>([]);
  rutinas = signal<Routine[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  search = signal('');

  showDetailPanel = signal(false);
  selectedCliente = signal<Cliente | null>(null);
  rutinaSeleccionada = signal('');

  showCrearPanel = signal(false);
  guardandoCliente = signal(false);
  errorCrear = signal<string | null>(null);
  confirmacionEntrada = signal<string | null>(null);
  registrandoEntrada = signal(false);

  nuevoCliente: NuevoCliente = {
    nombres: '',
    apellidos: '',
    email: '',
    password: '',
    objetivo: '',
  };

  filteredClientes = computed(() => {
    const q = this.search().toLowerCase().trim();
    if (!q) return this.clientes();
    return this.clientes().filter(
      (c) =>
        c.nombres.toLowerCase().includes(q) ||
        c.apellidos.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q)
    );
  });

  ngOnInit(): void {
    this.cargarClientes();

    this.http
      .get<Routine[]>(`${this.API}/routines?es_plantilla=true`)
      .pipe(catchError(() => of([])))
      .subscribe((lista) => this.rutinas.set(lista));
  }

  cargarClientes(): void {
    this.loading.set(true);
    this.error.set(null);

    this.http
      .get<Cliente[]>(`${this.API}/users?role=CLIENTE`)
      .pipe(
        catchError(() => {
          this.error.set('No se pudo cargar la lista de clientes. Verifica la conexión.');
          return of([]);
        }),
        finalize(() => this.loading.set(false))
      )
      .subscribe((lista) => this.clientes.set(lista));
  }

  selectCliente(c: Cliente): void {
    this.selectedCliente.set(c);
    this.rutinaSeleccionada.set('');
    this.confirmacionEntrada.set(null);
    this.showDetailPanel.set(true);
    this.showCrearPanel.set(false);
  }

  closePanel(): void {
    this.showDetailPanel.set(false);
    this.selectedCliente.set(null);
    this.confirmacionEntrada.set(null);
  }

  abrirCrearPanel(): void {
    this.showCrearPanel.set(true);
    this.showDetailPanel.set(false);
    this.selectedCliente.set(null);
    this.errorCrear.set(null);
    this.nuevoCliente = { nombres: '', apellidos: '', email: '', password: '', objetivo: '' };
  }

  cerrarCrearPanel(): void {
    this.showCrearPanel.set(false);
    this.errorCrear.set(null);
  }

  crearCliente(): void {
    if (!this.nuevoCliente.nombres || !this.nuevoCliente.apellidos || !this.nuevoCliente.email || !this.nuevoCliente.password) {
      this.errorCrear.set('Completa todos los campos obligatorios.');
      return;
    }

    this.guardandoCliente.set(true);
    this.errorCrear.set(null);

    const payload = {
      gym_id: null,
      role: 'CLIENTE',
      nombres: this.nuevoCliente.nombres,
      apellidos: this.nuevoCliente.apellidos,
      email: this.nuevoCliente.email,
      password: this.nuevoCliente.password,
      acepta_datos: true,
      ...(this.nuevoCliente.objetivo ? { objetivo: this.nuevoCliente.objetivo } : {}),
    };

    this.http
      .post<Cliente>(`${this.API}/users`, payload)
      .pipe(
        catchError(() => {
          this.errorCrear.set('No se pudo crear el cliente. Verifica los datos e intenta de nuevo.');
          return of(null);
        }),
        finalize(() => this.guardandoCliente.set(false))
      )
      .subscribe((creado) => {
        if (creado) {
          this.clientes.update((lista) => [creado, ...lista]);
          this.cerrarCrearPanel();
        }
      });
  }

  registrarEntrada(clienteId: string): void {
    this.registrandoEntrada.set(true);
    this.confirmacionEntrada.set(null);

    this.http
      .post(`${this.API}/attendance`, { cliente_id: clienteId, metodo: 'MANUAL' })
      .pipe(
        catchError(() => {
          this.confirmacionEntrada.set('ERROR');
          return of(null);
        }),
        finalize(() => this.registrandoEntrada.set(false))
      )
      .subscribe((res) => {
        if (res !== null) {
          this.confirmacionEntrada.set('OK');
        }
      });
  }

  verComposicion(clienteId: string): void {
    this.router.navigate(['/composicion'], { queryParams: { clienteId } });
  }

  verNutricion(clienteId: string): void {
    this.router.navigate(['/nutricion'], { queryParams: { clienteId } });
  }

  verProgreso(clienteId: string): void {
    this.router.navigate(['/progreso'], { queryParams: { clienteId } });
  }

  asignarRutina(clienteId: string, rutinaId: string): void {
    if (!rutinaId) {
      return;
    }
    alert('Próximamente: la asignación de rutinas a clientes estará disponible en Fase 3');
  }

  iniciales(c: Cliente): string {
    const n = c.nombres.charAt(0).toUpperCase();
    const a = c.apellidos.charAt(0).toUpperCase();
    return `${n}${a}`;
  }

  badgeObjetivo(objetivo: string): string {
    const map: Record<string, string> = {
      PERDER_GRASA: 'ug-badge-warn',
      GANAR_MUSCULO: 'ug-badge-ok',
      MANTENER: 'ug-badge-info',
      RECOMPOSICION: 'ug-badge-err',
    };
    return map[objetivo] ?? 'ug-badge-info';
  }

  labelObjetivo(objetivo: string): string {
    const map: Record<string, string> = {
      PERDER_GRASA: 'PERDER GRASA',
      GANAR_MUSCULO: 'GANAR MUSCULO',
      MANTENER: 'MANTENER',
      RECOMPOSICION: 'RECOMPOSICION',
    };
    return map[objetivo] ?? objetivo ?? '—';
  }

  isSelected(c: Cliente): boolean {
    return this.selectedCliente()?.id === c.id;
  }
}
