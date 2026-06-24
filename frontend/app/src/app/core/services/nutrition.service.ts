import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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

@Injectable({ providedIn: 'root' })
export class NutritionService {
  constructor(private http: HttpClient) {}

  getMiPlan(): Observable<NutritionPlan> {
    return this.http.get<NutritionPlan>(`${API_URL}/nutrition/mi-plan`);
  }
}
