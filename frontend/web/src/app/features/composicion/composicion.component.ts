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
  BodyCompositionService,
  BodyComposition,
} from '../../core/services/body-composition.service';

@Component({
  selector: 'app-composicion',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './composicion.component.html',
  styleUrl: './composicion.component.scss',
})
export class ComposicionComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly svc = inject(BodyCompositionService);

  clienteId = signal<string | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  historial = signal<BodyComposition[]>([]);
  ultima = signal<BodyComposition | null>(null);

  tieneHistorial = computed(() => this.historial().length > 0);

  ngOnInit(): void {
    const id = this.route.snapshot.queryParamMap.get('clienteId');
    this.clienteId.set(id);

    if (!id) {
      this.error.set('No se especificó un cliente. Verifica la URL.');
      this.loading.set(false);
      return;
    }

    forkJoin({
      historial: this.svc
        .getHistorialCliente(id, 20)
        .pipe(catchError(() => of([]))),
      ultima: this.svc
        .getUltimaCliente(id)
        .pipe(catchError(() => of(null))),
    }).subscribe({
      next: ({ historial, ultima }) => {
        this.historial.set(historial ?? []);
        this.ultima.set(ultima);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar la información de composición corporal.');
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

  badgeGrasa(pct: number | null): string {
    if (pct === null) return '';
    if (pct < 10 || pct > 35) return 'ug-badge-err';
    if (pct < 15 || pct > 28) return 'ug-badge-warn';
    return 'ug-badge-ok';
  }

  badgeImc(imc: number | null): string {
    if (imc === null) return '';
    if (imc < 18.5 || imc >= 30) return 'ug-badge-err';
    if (imc >= 25) return 'ug-badge-warn';
    return 'ug-badge-ok';
  }

  badgeVisceral(v: number | null): string {
    if (v === null) return '';
    if (v >= 13) return 'ug-badge-err';
    if (v >= 10) return 'ug-badge-warn';
    return 'ug-badge-ok';
  }

  labelFuente(fuente: 'PESA' | 'MANUAL'): string {
    return fuente === 'PESA' ? 'Pesa BIA' : 'Manual';
  }
}
