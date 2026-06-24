import { Component, OnInit, signal } from '@angular/core';
import { NutritionService, NutritionPlan } from '../../core/services/nutrition.service';

@Component({
  selector: 'app-nutricion',
  templateUrl: 'nutricion.page.html',
  styleUrls: ['nutricion.page.scss'],
  standalone: false,
})
export class NutricionPage implements OnInit {
  plan = signal<NutritionPlan | null>(null);
  cargando = signal(true);
  sinPlan = signal(false);
  errorMsg = signal<string | null>(null);

  constructor(private nutritionService: NutritionService) {}

  ngOnInit(): void {
    this.cargarPlan();
  }

  ionViewWillEnter(): void {
    this.cargarPlan();
  }

  cargarPlan(): void {
    this.cargando.set(true);
    this.sinPlan.set(false);
    this.errorMsg.set(null);

    this.nutritionService.getMiPlan().subscribe({
      next: (data) => {
        this.plan.set(data);
        this.cargando.set(false);
      },
      error: (err) => {
        this.cargando.set(false);
        if (err?.status === 404) {
          this.sinPlan.set(true);
        } else {
          this.errorMsg.set('No se pudo cargar tu plan nutricional. Intenta de nuevo.');
        }
      },
    });
  }

  labelObjetivo(objetivo: string): string {
    const map: Record<string, string> = {
      PERDER_GRASA: 'Perder grasa',
      GANAR_MUSCULO: 'Ganar músculo',
      MANTENER: 'Mantener peso',
      RECOMPOSICION: 'Recomposición',
    };
    return map[objetivo] ?? objetivo;
  }

  iconoObjetivo(objetivo: string): string {
    const map: Record<string, string> = {
      PERDER_GRASA: 'flame-outline',
      GANAR_MUSCULO: 'barbell-outline',
      MANTENER: 'checkmark-circle-outline',
      RECOMPOSICION: 'sync-outline',
    };
    return map[objetivo] ?? 'nutrition-outline';
  }

  pctProteina(plan: NutritionPlan): number {
    const totalCalorias = plan.proteina_g * 4 + plan.carbos_g * 4 + plan.grasa_g * 9;
    if (totalCalorias === 0) return 0;
    return Math.round((plan.proteina_g * 4 / totalCalorias) * 100);
  }

  pctCarbos(plan: NutritionPlan): number {
    const totalCalorias = plan.proteina_g * 4 + plan.carbos_g * 4 + plan.grasa_g * 9;
    if (totalCalorias === 0) return 0;
    return Math.round((plan.carbos_g * 4 / totalCalorias) * 100);
  }

  pctGrasa(plan: NutritionPlan): number {
    const totalCalorias = plan.proteina_g * 4 + plan.carbos_g * 4 + plan.grasa_g * 9;
    if (totalCalorias === 0) return 0;
    return Math.round((plan.grasa_g * 9 / totalCalorias) * 100);
  }

  mealsSorted(plan: NutritionPlan) {
    return [...plan.meals].sort((a, b) => a.orden - b.orden);
  }

  kcalComida(meal: { kcal: number | null; items: { kcal: number | null }[] }): number | null {
    if (meal.kcal != null) return meal.kcal;
    const suma = meal.items.reduce((acc, item) => acc + (item.kcal ?? 0), 0);
    return meal.items.length > 0 ? Math.round(suma) : null;
  }
}
