import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';

export interface RegistroAsistencia {
  id: string;
  cliente_id: string;
  cliente?: {
    nombres: string;
    apellidos: string;
  };
  metodo: string;
  created_at: string;
}

export interface ClienteOpc {
  id: string;
  nombres: string;
  apellidos: string;
}

@Component({
  selector: 'app-asistencia',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './asistencia.component.html',
  styleUrl: './asistencia.component.scss',
})
export class AsistenciaComponent implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly API = 'https://uniquegym.onrender.com/api/v1';

  registros = signal<RegistroAsistencia[]>([]);
  clientes = signal<ClienteOpc[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  desde = signal<string>(this.hoyISO());
  hasta = signal<string>(this.hoyISO());

  showModalManual = signal(false);
  clienteSeleccionadoId = signal('');
  registrando = signal(false);
  errorModal = signal<string | null>(null);
  confirmacionModal = signal(false);

  total = computed(() => this.registros().length);

  ngOnInit(): void {
    this.cargarRegistros();
    this.cargarClientes();
  }

  hoyISO(): string {
    return new Date().toISOString().split('T')[0];
  }

  cargarRegistros(): void {
    this.loading.set(true);
    this.error.set(null);

    this.http
      .get<RegistroAsistencia[]>(
        `${this.API}/attendance?desde=${this.desde()}&hasta=${this.hasta()}`
      )
      .pipe(
        catchError(() => {
          this.error.set('No se pudo cargar la asistencia. Verifica la conexion.');
          return of([]);
        }),
        finalize(() => this.loading.set(false))
      )
      .subscribe((lista) => this.registros.set(lista));
  }

  cargarClientes(): void {
    this.http
      .get<ClienteOpc[]>(`${this.API}/users?role=CLIENTE`)
      .pipe(catchError(() => of([])))
      .subscribe((lista) => this.clientes.set(lista));
  }

  filtrar(): void {
    this.cargarRegistros();
  }

  abrirModalManual(): void {
    this.clienteSeleccionadoId.set('');
    this.errorModal.set(null);
    this.confirmacionModal.set(false);
    this.showModalManual.set(true);
  }

  cerrarModal(): void {
    this.showModalManual.set(false);
  }

  registrarManual(): void {
    if (!this.clienteSeleccionadoId()) {
      this.errorModal.set('Selecciona un cliente.');
      return;
    }

    this.registrando.set(true);
    this.errorModal.set(null);

    this.http
      .post<RegistroAsistencia>(`${this.API}/attendance`, {
        cliente_id: this.clienteSeleccionadoId(),
        metodo: 'MANUAL',
      })
      .pipe(
        catchError(() => {
          this.errorModal.set('No se pudo registrar la entrada. Intenta de nuevo.');
          return of(null);
        }),
        finalize(() => this.registrando.set(false))
      )
      .subscribe((nuevo) => {
        if (nuevo) {
          this.confirmacionModal.set(true);
          this.registros.update((lista) => [nuevo, ...lista]);
          setTimeout(() => {
            this.showModalManual.set(false);
            this.confirmacionModal.set(false);
          }, 1500);
        }
      });
  }

  formatHora(fecha: string): string {
    return new Date(fecha).toLocaleTimeString('es-CO', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  formatFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  nombreCliente(r: RegistroAsistencia): string {
    if (r.cliente) {
      return `${r.cliente.nombres} ${r.cliente.apellidos}`;
    }
    const c = this.clientes().find((x) => x.id === r.cliente_id);
    return c ? `${c.nombres} ${c.apellidos}` : r.cliente_id;
  }

  labelMetodo(metodo: string): string {
    const map: Record<string, string> = {
      MANUAL: 'Manual',
      QR: 'QR',
      APP: 'App',
    };
    return map[metodo] ?? metodo;
  }

  nombreClienteOpc(c: ClienteOpc): string {
    return `${c.nombres} ${c.apellidos}`;
  }
}
