import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

const API_URL = 'https://uniquegym.onrender.com/api/v1';

export interface NutritionMealItem {
  id: string;
  alimento: string;
  porcion: string | null;
  kcal: number | null;
  proteina_g: number | null;
  carbos_g: number | null;
  grasa_g: number | null;
}

export interface NutritionMeal {
  id: string;
  nombre: string;
  orden: number;
  kcal: number | null;
  items: NutritionMealItem[];
}

export interface NutritionPlan {
  id: string;
  objetivo: 'PERDER_GRASA' | 'GANAR_MUSCULO' | 'MANTENER' | 'RECOMPOSICION';
  kcal_objetivo: number;
  proteina_g: number;
  carbos_g: number;
  grasa_g: number;
  agua_ml: number | null;
  notas: string | null;
  meals: NutritionMeal[];
}

function mapPlan(raw: any): NutritionPlan {
  const comidas: any[] = raw.comidas ?? raw.meals ?? [];
  return {
    id: raw.id,
    objetivo: raw.objetivo,
    kcal_objetivo: raw.kcal_objetivo,
    proteina_g: raw.proteina_g,
    carbos_g: raw.carbos_g,
    grasa_g: raw.grasa_g,
    agua_ml: raw.agua_ml ?? null,
    notas: raw.notas ?? null,
    meals: comidas.map((c: any) => ({
      id: c.id,
      nombre: c.nombre,
      orden: c.orden,
      kcal: c.kcal ?? null,
      items: (c.alimentos ?? c.items ?? []) as NutritionMealItem[],
    })),
  };
}

@Injectable({ providedIn: 'root' })
export class NutritionService {
  constructor(private http: HttpClient) {}

  getMiPlan(): Observable<NutritionPlan> {
    return this.http
      .get<any>(`${API_URL}/nutrition/mi-plan`)
      .pipe(map(res => mapPlan(res?.data ?? res)));
  }
}
