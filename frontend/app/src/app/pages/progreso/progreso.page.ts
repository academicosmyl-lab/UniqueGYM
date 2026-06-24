import { Component, signal } from '@angular/core';
import {
  AnalyticsService,
  ProgresoComposicion,
  ProgresoEntrenamiento,
} from '../../core/services/analytics.service';

@Component({
  selector: 'app-progreso',
  templateUrl: 'progreso.page.html',
  styleUrls: ['progreso.page.scss'],
  standalone: false,
})
export class ProgresoPage {
  segmento = signal<'cuerpo' | 'entrenamiento'>('cuerpo');

  cargandoCuerpo = signal(true);
  errorCuerpo = signal<string | null>(null);
  composicion = signal<ProgresoComposicion | null>(null);

  cargandoEntrenamiento = signal(true);
  errorEntrenamiento = signal<string | null>(null);
  entrenamiento = signal<ProgresoEntrenamiento | null>(null);

  constructor(private analytics: AnalyticsService) {}

  ionViewWillEnter(): void {
    this.cargarCuerpo();
    this.cargarEntrenamiento();
  }

  cambiarSegmento(evento: CustomEvent): void {
    this.segmento.set(evento.detail.value as 'cuerpo' | 'entrenamiento');
  }

  cargarCuerpo(): void {
    this.cargandoCuerpo.set(true);
    this.errorCuerpo.set(null);
    this.analytics.getMiProgresoComposicion().subscribe({
      next: (data) => {
        this.composicion.set(data);
        this.cargandoCuerpo.set(false);
      },
      error: () => {
        this.errorCuerpo.set('No se pudo cargar el progreso de composición.');
        this.cargandoCuerpo.set(false);
      },
    });
  }

  cargarEntrenamiento(): void {
    this.cargandoEntrenamiento.set(true);
    this.errorEntrenamiento.set(null);
    this.analytics.getMiProgresoEntrenamiento().subscribe({
      next: (data) => {
        this.entrenamiento.set(data);
        this.cargandoEntrenamiento.set(false);
      },
      error: () => {
        this.errorEntrenamiento.set('No se pudo cargar el progreso de entrenamiento.');
        this.cargandoEntrenamiento.set(false);
      },
    });
  }

  ultimasFilas(): { fecha: string; peso: number | null; grasa: number | null }[] {
    const c = this.composicion();
    if (!c) return [];
    const total = c.labels.length;
    const desde = Math.max(0, total - 5);
    const filas = [];
    for (let i = desde; i < total; i++) {
      filas.push({
        fecha: c.labels[i],
        peso: c.peso.values[i] ?? null,
        grasa: c.grasa.values[i] ?? null,
      });
    }
    return filas.reverse();
  }

  porcentajePeso(): number {
    const c = this.composicion();
    if (!c || c.peso.values.length < 2) return 0;
    const inicial = c.peso.values[0];
    const actual = c.peso.values[c.peso.values.length - 1];
    if (inicial === 0) return 0;
    return Math.min(100, Math.max(0, Math.round((actual / inicial) * 100)));
  }

  porcentajeGrasa(): number {
    const c = this.composicion();
    if (!c || c.grasa.values.length < 2) return 0;
    const inicial = c.grasa.values[0];
    const actual = c.grasa.values[c.grasa.values.length - 1];
    if (inicial === 0) return 0;
    return Math.min(100, Math.max(0, Math.round((actual / inicial) * 100)));
  }

  pesoInicial(): number | null {
    const c = this.composicion();
    if (!c || c.peso.values.length === 0) return null;
    return c.peso.values[0];
  }

  pesoActual(): number | null {
    const c = this.composicion();
    if (!c || c.peso.values.length === 0) return null;
    return c.peso.values[c.peso.values.length - 1];
  }

  grasaInicial(): number | null {
    const c = this.composicion();
    if (!c || c.grasa.values.length === 0) return null;
    return c.grasa.values[0];
  }

  grasaActual(): number | null {
    const c = this.composicion();
    if (!c || c.grasa.values.length === 0) return null;
    return c.grasa.values[c.grasa.values.length - 1];
  }

  labelTendencia(): string {
    const c = this.composicion();
    if (!c) return '';
    if (c.tendencia === 'mejorando') return 'Mejorando';
    if (c.tendencia === 'empeorando') return 'Empeorando';
    return 'Estable';
  }

  emojiTendencia(): string {
    const c = this.composicion();
    if (!c) return '';
    if (c.tendencia === 'mejorando') return '💪';
    if (c.tendencia === 'empeorando') return '⚠️';
    return '';
  }

  claseTendencia(): string {
    const c = this.composicion();
    if (!c) return '';
    return c.tendencia;
  }

  adherenciaGrados(): number {
    const e = this.entrenamiento();
    if (!e) return 0;
    return Math.round((Math.min(100, Math.max(0, e.adherencia)) / 100) * 360);
  }

  hayRecords(): boolean {
    const e = this.entrenamiento();
    return !!e && e.records.length > 0;
  }

  haySuficientesCuerpo(): boolean {
    const c = this.composicion();
    return !!c && c.labels.length >= 2;
  }

  haySuficientesEntrenamiento(): boolean {
    const e = this.entrenamiento();
    return !!e;
  }
}
