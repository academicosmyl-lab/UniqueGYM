import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
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

const MOCK_CLIENTES: Cliente[] = [
  {
    id: '1',
    nombres: 'Ana García',
    apellidos: 'López',
    email: 'ana@gym.co',
    activo: true,
    objetivo: 'PERDER_GRASA',
  },
  {
    id: '2',
    nombres: 'Carlos Ruiz',
    apellidos: 'Mendez',
    email: 'carlos@gym.co',
    activo: true,
    objetivo: 'GANAR_MUSCULO',
  },
  {
    id: '3',
    nombres: 'María Torres',
    apellidos: 'Silva',
    email: 'maria@gym.co',
    activo: false,
    objetivo: 'MANTENER',
  },
];

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './clientes.component.html',
  styleUrl: './clientes.component.scss',
})
export class ClientesComponent implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly API = 'https://uniquegym.onrender.com/api/v1';

  clientes = signal<Cliente[]>([]);
  rutinas = signal<Routine[]>([]);
  loading = signal(false);
  search = signal('');
  showDetailPanel = signal(false);
  selectedCliente = signal<Cliente | null>(null);
  rutinaSeleccionada = signal('');

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
    this.loading.set(true);
    // El endpoint /users?role=CLIENTE no está implementado aún — se usan datos mock
    this.clientes.set(MOCK_CLIENTES);
    this.loading.set(false);

    this.http
      .get<Routine[]>(`${this.API}/routines?es_plantilla=true`)
      .pipe(catchError(() => of([])))
      .subscribe((lista) => this.rutinas.set(lista));
  }

  selectCliente(c: Cliente): void {
    this.selectedCliente.set(c);
    this.rutinaSeleccionada.set('');
    this.showDetailPanel.set(true);
  }

  closePanel(): void {
    this.showDetailPanel.set(false);
    this.selectedCliente.set(null);
  }

  asignarRutina(clienteId: string, rutinaId: string): void {
    if (!rutinaId) {
      alert('Selecciona una rutina primero');
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
      GANAR_MUSCULO: 'GANAR MÚSCULO',
      MANTENER: 'MANTENER',
      RECOMPOSICION: 'RECOMPOSICIÓN',
    };
    return map[objetivo] ?? objetivo;
  }

  isSelected(c: Cliente): boolean {
    return this.selectedCliente()?.id === c.id;
  }
}
