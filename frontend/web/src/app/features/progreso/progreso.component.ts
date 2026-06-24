import {
  Component,
  OnInit,
  inject,
  signal,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import {
  AnalyticsService,
  ComposicionClienteData,
  EntrenamientoClienteData,
} from '../../core/services/analytics.service';

@Component({
  selector: 'app-progreso',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './progreso.component.html',
  styleUrl: './progreso.component.scss',
})
export class ProgresoComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly svc = inject(AnalyticsService);

  clienteId = signal<string | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  composicion = signal<ComposicionClienteData | null>(null);
  entrenamiento = signal<EntrenamientoClienteData | null>(null);

  tieneComposicion = computed(() => {
    const c = this.composicion();
    return c !== null && c.labels.length > 0;
  });

  tieneEntrenamiento = computed(() => {
    const e = this.entrenamiento();
    return e !== null && e.volumenPorSesion.labels.length > 0;
  });

  adherenciaPct = computed(() => {
    const e = this.entrenamiento();
    if (!e) return 0;
    return Math.min(100, Math.max(0, e.adherencia));
  });

  claseAdherencia = computed(() => {
    const v = this.adherenciaPct();
    if (v < 50) return 'barra-baja';
    if (v < 75) return 'barra-media';
    return 'barra-alta';
  });

  badgeTendencia = computed(() => {
    const c = this.composicion();
    if (!c) return '';
    switch (c.tendencia) {
      case 'mejorando':   return 'badge-mejorando';
      case 'estable':     return 'badge-estable';
      case 'empeorando':  return 'badge-empeorando';
      default:            return '';
    }
  });

  labelTendencia = computed(() => {
    const c = this.composicion();
    if (!c) return '';
    switch (c.tendencia) {
      case 'mejorando':  return 'Mejorando';
      case 'estable':    return 'Estable';
      case 'empeorando': return 'Empeorando';
      default:           return c.tendencia;
    }
  });

  pendientePesoBadge = computed(() => {
    const c = this.composicion();
    if (!c) return 'barra-neutra';
    return c.peso.pendiente > 0 ? 'barra-rojo' : 'barra-verde';
  });

  pendienteGrasaBadge = computed(() => {
    const c = this.composicion();
    if (!c) return 'barra-neutra';
    return c.grasa.pendiente > 0 ? 'barra-rojo' : 'barra-verde';
  });

  volumenMax = computed(() => {
    const e = this.entrenamiento();
    if (!e || !e.volumenPorSesion.values.length) return 1;
    return Math.max(...e.volumenPorSesion.values) || 1;
  });

  filasPeso = computed(() => {
    const c = this.composicion();
    if (!c) return [];
    return c.labels.map((label, i) => ({
      label,
      valor: c.peso.values[i] ?? null,
      suavizado: c.peso.suavizado[i] ?? null,
    }));
  });

  filasGrasa = computed(() => {
    const c = this.composicion();
    if (!c) return [];
    return c.labels.map((label, i) => ({
      label,
      valor: c.grasa.values[i] ?? null,
      suavizado: c.grasa.suavizado[i] ?? null,
    }));
  });

  barrasVolumen = computed(() => {
    const e = this.entrenamiento();
    if (!e) return [];
    const max = this.volumenMax();
    return e.volumenPorSesion.labels.map((label, i) => ({
      label,
      valor: e.volumenPorSesion.values[i] ?? 0,
      pct: max > 0 ? ((e.volumenPorSesion.values[i] ?? 0) / max) * 100 : 0,
    }));
  });

  ngOnInit(): void {
    const id = this.route.snapshot.queryParamMap.get('clienteId');
    this.clienteId.set(id);

    if (!id) {
      this.error.set('No se especificó un cliente. Verifica la URL.');
      this.loading.set(false);
      return;
    }

    forkJoin({
      composicion: this.svc
        .getComposicionCliente(id)
        .pipe(catchError(() => of(null))),
      entrenamiento: this.svc
        .getEntrenamientoCliente(id)
        .pipe(catchError(() => of(null))),
    }).subscribe({
      next: ({ composicion, entrenamiento }) => {
        this.composicion.set(composicion);
        this.entrenamiento.set(entrenamiento);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar el progreso del cliente.');
        this.loading.set(false);
      },
    });
  }

  formatFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  formatNum(val: number | null, decimales = 1): string {
    if (val === null || val === undefined) return '—';
    return val.toFixed(decimales);
  }

  formatFechaRecord(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-CO', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }
}
