import {
  Component,
  OnInit,
  inject,
  signal,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { catchError, of } from 'rxjs';
import {
  NutritionService,
  PlanNutricional,
  Comida,
  ObjetivoNutricional,
  CrearPlanDto,
  AgregarComidaDto,
  AgregarAlimentoDto,
} from '../../core/services/nutrition.service';

@Component({
  selector: 'app-nutricion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './nutricion.component.html',
  styleUrl: './nutricion.component.scss',
})
export class NutricionComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly svc = inject(NutritionService);

  clienteId = signal<string | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  planes = signal<PlanNutricional[]>([]);
  planActivo = computed<PlanNutricional | null>(() => {
    const lista = this.planes();
    return lista.length > 0 ? lista[0] : null;
  });

  mostrarFormPlan = signal(false);
  guardandoPlan = signal(false);
  errorPlan = signal<string | null>(null);

  nuevoPlan: CrearPlanDto = {
    cliente_id: '',
    objetivo: 'MANTENER',
    kcal_objetivo: undefined,
    notas: '',
  };

  objetivos: { valor: ObjetivoNutricional; etiqueta: string }[] = [
    { valor: 'PERDER_GRASA', etiqueta: 'Perder grasa' },
    { valor: 'GANAR_MUSCULO', etiqueta: 'Ganar musculo' },
    { valor: 'MANTENER', etiqueta: 'Mantener' },
    { valor: 'RECOMPOSICION', etiqueta: 'Recomposicion' },
  ];

  nombreComidaPorPlan: Record<string, string> = {};
  guardandoComida: Record<string, boolean> = {};
  mostrarFormComidaPorPlan: Record<string, boolean> = {};

  mostrarFormAlimentoPorComida: Record<string, boolean> = {};
  guardandoAlimento: Record<string, boolean> = {};
  nuevoAlimentoPorComida: Record<string, AgregarAlimentoDto> = {};

  ngOnInit(): void {
    const id = this.route.snapshot.queryParamMap.get('clienteId');
    this.clienteId.set(id);

    if (!id) {
      this.error.set('No se especifico un cliente. Verifica la URL.');
      this.loading.set(false);
      return;
    }

    this.nuevoPlan.cliente_id = id;
    this.cargarPlanes(id);
  }

  private cargarPlanes(clienteId: string): void {
    this.loading.set(true);
    this.svc
      .getPlanesCliente(clienteId)
      .pipe(catchError(() => of([])))
      .subscribe({
        next: (planes) => {
          this.planes.set(planes ?? []);
          this.loading.set(false);
        },
        error: () => {
          this.error.set('No se pudo cargar el plan nutricional.');
          this.loading.set(false);
        },
      });
  }

  abrirFormPlan(): void {
    this.mostrarFormPlan.set(true);
    this.errorPlan.set(null);
  }

  cerrarFormPlan(): void {
    this.mostrarFormPlan.set(false);
    this.errorPlan.set(null);
    this.nuevoPlan = {
      cliente_id: this.clienteId() ?? '',
      objetivo: 'MANTENER',
      kcal_objetivo: undefined,
      notas: '',
    };
  }

  crearPlan(): void {
    if (!this.nuevoPlan.objetivo) return;
    this.guardandoPlan.set(true);
    this.errorPlan.set(null);

    const dto: CrearPlanDto = {
      cliente_id: this.nuevoPlan.cliente_id,
      objetivo: this.nuevoPlan.objetivo,
    };
    if (this.nuevoPlan.kcal_objetivo) dto.kcal_objetivo = this.nuevoPlan.kcal_objetivo;
    if (this.nuevoPlan.notas?.trim()) dto.notas = this.nuevoPlan.notas.trim();

    this.svc.crearPlan(dto).subscribe({
      next: (plan) => {
        const lista = [{ ...plan, comidas: plan.comidas ?? [] }, ...this.planes()];
        this.planes.set(lista);
        this.guardandoPlan.set(false);
        this.cerrarFormPlan();
      },
      error: () => {
        this.errorPlan.set('No se pudo crear el plan. Intenta de nuevo.');
        this.guardandoPlan.set(false);
      },
    });
  }

  toggleFormComida(planId: string): void {
    this.mostrarFormComidaPorPlan[planId] = !this.mostrarFormComidaPorPlan[planId];
    if (!this.nombreComidaPorPlan[planId]) {
      this.nombreComidaPorPlan[planId] = '';
    }
  }

  agregarComida(planId: string): void {
    const nombre = (this.nombreComidaPorPlan[planId] ?? '').trim();
    if (!nombre) return;
    this.guardandoComida[planId] = true;

    const dto: AgregarComidaDto = { nombre };
    this.svc.agregarComida(planId, dto).subscribe({
      next: (comida) => {
        const lista = this.planes().map((p) => {
          if (p.id !== planId) return p;
          return { ...p, comidas: [...(p.comidas ?? []), { ...comida, alimentos: [] }] };
        });
        this.planes.set(lista);
        this.nombreComidaPorPlan[planId] = '';
        this.mostrarFormComidaPorPlan[planId] = false;
        this.guardandoComida[planId] = false;
      },
      error: () => {
        this.guardandoComida[planId] = false;
      },
    });
  }

  toggleFormAlimento(comidaId: string): void {
    this.mostrarFormAlimentoPorComida[comidaId] = !this.mostrarFormAlimentoPorComida[comidaId];
    if (!this.nuevoAlimentoPorComida[comidaId]) {
      this.nuevoAlimentoPorComida[comidaId] = { alimento: '' };
    }
  }

  agregarAlimento(planId: string, comidaId: string): void {
    const dto = this.nuevoAlimentoPorComida[comidaId];
    if (!dto?.alimento?.trim()) return;
    this.guardandoAlimento[comidaId] = true;

    const payload: AgregarAlimentoDto = {
      alimento: dto.alimento.trim(),
    };
    if (dto.porcion) payload.porcion = dto.porcion;
    if (dto.kcal) payload.kcal = dto.kcal;
    if (dto.proteina_g) payload.proteina_g = dto.proteina_g;
    if (dto.carbos_g) payload.carbos_g = dto.carbos_g;
    if (dto.grasa_g) payload.grasa_g = dto.grasa_g;

    this.svc.agregarAlimento(comidaId, payload).subscribe({
      next: (alimento) => {
        const lista = this.planes().map((p) => {
          if (p.id !== planId) return p;
          return {
            ...p,
            comidas: p.comidas.map((c) => {
              if (c.id !== comidaId) return c;
              return { ...c, alimentos: [...(c.alimentos ?? []), alimento] };
            }),
          };
        });
        this.planes.set(lista);
        this.nuevoAlimentoPorComida[comidaId] = { alimento: '' };
        this.mostrarFormAlimentoPorComida[comidaId] = false;
        this.guardandoAlimento[comidaId] = false;
      },
      error: () => {
        this.guardandoAlimento[comidaId] = false;
      },
    });
  }

  etiquetaObjetivo(objetivo: ObjetivoNutricional): string {
    const mapa: Record<ObjetivoNutricional, string> = {
      PERDER_GRASA: 'Perder grasa',
      GANAR_MUSCULO: 'Ganar musculo',
      MANTENER: 'Mantener',
      RECOMPOSICION: 'Recomposicion',
    };
    return mapa[objetivo] ?? objetivo;
  }

  badgeObjetivo(objetivo: ObjetivoNutricional): string {
    const mapa: Record<ObjetivoNutricional, string> = {
      PERDER_GRASA: 'badge-perder',
      GANAR_MUSCULO: 'badge-ganar',
      MANTENER: 'badge-mantener',
      RECOMPOSICION: 'badge-recomp',
    };
    return mapa[objetivo] ?? '';
  }

  formatNum(val: number | null, decimales = 0): string {
    if (val === null || val === undefined) return '—';
    return val.toFixed(decimales);
  }

  formatFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  totalKcalComida(comida: Comida): number {
    if (!comida.alimentos?.length) return comida.kcal ?? 0;
    return comida.alimentos.reduce((s, a) => s + (a.kcal ?? 0), 0);
  }
}
