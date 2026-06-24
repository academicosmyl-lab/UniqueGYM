import { Component, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import {
  BodyCompositionService,
  BodyComposition,
} from '../../core/services/body-composition.service';

@Component({
  selector: 'app-composicion-historial',
  templateUrl: 'composicion-historial.page.html',
  styleUrls: ['composicion-historial.page.scss'],
  standalone: false,
})
export class ComposicionHistorialPage implements OnInit {
  loading = signal(true);
  mediciones = signal<BodyComposition[]>([]);
  errorMsg = signal<string | null>(null);

  constructor(
    private bodyService: BodyCompositionService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarHistorial();
  }

  ionViewWillEnter(): void {
    this.cargarHistorial();
  }

  cargarHistorial(): void {
    this.loading.set(true);
    this.errorMsg.set(null);

    this.bodyService.getMisMediciones(20).subscribe({
      next: (data) => {
        this.mediciones.set(data);
        this.loading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        this.errorMsg.set('No se pudo cargar el historial. Intenta de nuevo.');
      },
    });
  }

  nueva(): void {
    this.router.navigate(['/tabs/cuerpo']);
  }

  volver(): void {
    this.router.navigate(['/tabs/cuerpo']);
  }

  clasifGrasa(valor: number | null, sexo = 'F'): string {
    if (valor == null) return '';
    if (sexo === 'M') {
      if (valor < 6) return 'muy-bajo';
      if (valor <= 13) return 'atleta';
      if (valor <= 17) return 'fitness';
      if (valor <= 24) return 'promedio';
      return 'obeso';
    }
    if (valor < 14) return 'muy-bajo';
    if (valor <= 20) return 'atleta';
    if (valor <= 24) return 'fitness';
    if (valor <= 31) return 'promedio';
    return 'obeso';
  }

  labelGrasa(valor: number | null, sexo = 'F'): string {
    if (valor == null) return '-';
    const c = this.clasifGrasa(valor, sexo);
    const mapa: Record<string, string> = {
      'muy-bajo': 'Muy bajo',
      atleta: 'Atleta',
      fitness: 'Fitness',
      promedio: 'Promedio',
      obeso: 'Obesidad',
    };
    return mapa[c] ?? '-';
  }

  colorGrasa(valor: number | null): string {
    const c = this.clasifGrasa(valor);
    const mapa: Record<string, string> = {
      'muy-bajo': '#4fc3f7',
      atleta: '#1DDE10',
      fitness: '#c8e600',
      promedio: '#ffa726',
      obeso: '#E0653F',
    };
    return mapa[c] ?? 'var(--ug-apagado)';
  }

  clasifVisceral(valor: number | null): string {
    if (valor == null) return '';
    return valor <= 12 ? 'saludable' : 'alto-riesgo';
  }

  labelVisceral(valor: number | null): string {
    if (valor == null) return '';
    return valor <= 12 ? 'Saludable' : 'Alto riesgo';
  }

  formatFecha(fecha: string): string {
    const d = new Date(fecha);
    const opciones: Intl.DateTimeFormatOptions = {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    };
    return d.toLocaleDateString('es-CO', opciones);
  }
}
