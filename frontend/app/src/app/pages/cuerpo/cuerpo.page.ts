import { Component, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { BodyCompositionService, BodyComposition } from '../../core/services/body-composition.service';

@Component({
  selector: 'app-cuerpo',
  templateUrl: 'cuerpo.page.html',
  styleUrls: ['cuerpo.page.scss'],
  standalone: false,
})
export class CuerpoPage implements OnInit {
  form!: FormGroup;
  guardando = signal(false);
  errorMsg = signal<string | null>(null);
  ultimaMedicion = signal<BodyComposition | null>(null);
  cargandoUltima = signal(true);

  constructor(
    private fb: FormBuilder,
    private bodyService: BodyCompositionService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      peso_kg: [null, [Validators.min(20), Validators.max(300)]],
      grasa_pct: [null, [Validators.min(0), Validators.max(70)]],
      agua_pct: [null, [Validators.min(0), Validators.max(100)]],
      musculo_kg: [null, [Validators.min(0), Validators.max(200)]],
      grasa_visceral: [null, [Validators.min(1), Validators.max(30)]],
      tmb_kcal: [null, [Validators.min(500), Validators.max(5000)]],
      imc: [null, [Validators.min(10), Validators.max(60)]],
    });
    this.cargarUltima();
  }

  ionViewWillEnter(): void {
    this.cargarUltima();
  }

  cargarUltima(): void {
    this.cargandoUltima.set(true);
    this.bodyService.getMiUltima().subscribe({
      next: (data) => {
        this.ultimaMedicion.set(data);
        this.cargandoUltima.set(false);
      },
      error: () => {
        this.ultimaMedicion.set(null);
        this.cargandoUltima.set(false);
      },
    });
  }

  guardar(): void {
    if (this.guardando()) return;

    const val = this.form.value;
    const alMenosUnCampo =
      val.peso_kg != null ||
      val.grasa_pct != null ||
      val.agua_pct != null ||
      val.musculo_kg != null ||
      val.grasa_visceral != null ||
      val.tmb_kcal != null ||
      val.imc != null;

    if (!alMenosUnCampo) {
      this.errorMsg.set('Ingresa al menos un valor para guardar la medición.');
      return;
    }

    if (this.form.invalid) {
      this.errorMsg.set('Revisa los valores ingresados.');
      return;
    }

    this.errorMsg.set(null);
    this.guardando.set(true);

    const dto: Record<string, number | string> = { fuente: 'MANUAL' };
    if (val.peso_kg != null) dto['peso_kg'] = val.peso_kg;
    if (val.grasa_pct != null) dto['grasa_pct'] = val.grasa_pct;
    if (val.agua_pct != null) dto['agua_pct'] = val.agua_pct;
    if (val.musculo_kg != null) dto['musculo_kg'] = val.musculo_kg;
    if (val.grasa_visceral != null) dto['grasa_visceral'] = val.grasa_visceral;
    if (val.tmb_kcal != null) dto['tmb_kcal'] = val.tmb_kcal;
    if (val.imc != null) dto['imc'] = val.imc;

    this.bodyService.registrar(dto).subscribe({
      next: () => {
        this.guardando.set(false);
        this.form.reset();
        this.router.navigate(['/tabs/cuerpo/historial']);
      },
      error: () => {
        this.guardando.set(false);
        this.errorMsg.set('No se pudo guardar la medición. Intenta de nuevo.');
      },
    });
  }

  irHistorial(): void {
    this.router.navigate(['/tabs/cuerpo/historial']);
  }

  clasifGrasa(valor: number | null): string {
    if (valor == null) return '';
    if (valor < 14) return 'muy-bajo';
    if (valor <= 20) return 'atleta';
    if (valor <= 24) return 'fitness';
    if (valor <= 31) return 'promedio';
    return 'obeso';
  }

  labelGrasa(valor: number | null): string {
    if (valor == null) return '-';
    if (valor < 14) return 'Muy bajo';
    if (valor <= 20) return 'Atleta';
    if (valor <= 24) return 'Fitness';
    if (valor <= 31) return 'Promedio';
    return 'Obesidad';
  }

  labelVisceral(valor: number | null): string {
    if (valor == null) return '-';
    return valor <= 12 ? 'Saludable' : 'Alto riesgo';
  }

  clasifVisceral(valor: number | null): string {
    if (valor == null) return '';
    return valor <= 12 ? 'saludable' : 'obeso';
  }
}
