import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

export type ObjetivoNutricional =
  | 'PERDER_GRASA'
  | 'GANAR_MUSCULO'
  | 'MANTENER'
  | 'RECOMPOSICION';

export interface Alimento {
  id: string;
  alimento: string;
  porcion: string | null;
  kcal: number | null;
  proteina_g: number | null;
  carbos_g: number | null;
  grasa_g: number | null;
}

export interface Comida {
  id: string;
  nombre: string;
  orden: number | null;
  kcal: number | null;
  alimentos: Alimento[];
}

export interface PlanNutricional {
  id: string;
  cliente_id: string;
  objetivo: ObjetivoNutricional;
  kcal_objetivo: number | null;
  proteina_g: number | null;
  carbos_g: number | null;
  grasa_g: number | null;
  agua_ml: number | null;
  notas: string | null;
  created_at: string;
  comidas: Comida[];
}

export interface CrearPlanDto {
  cliente_id: string;
  objetivo: ObjetivoNutricional;
  kcal_objetivo?: number;
  proteina_g?: number;
  carbos_g?: number;
  grasa_g?: number;
  agua_ml?: number;
  notas?: string;
}

export interface AgregarComidaDto {
  nombre: string;
  orden?: number;
  kcal?: number;
}

export interface AgregarAlimentoDto {
  alimento: string;
  porcion?: string;
  kcal?: number;
  proteina_g?: number;
  carbos_g?: number;
  grasa_g?: number;
}

@Injectable({ providedIn: 'root' })
export class NutritionService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);

  private readonly API = 'https://uniquegym.onrender.com/api/v1';

  private headers(): HttpHeaders {
    const token = this.auth.getToken();
    return token
      ? new HttpHeaders({ Authorization: `Bearer ${token}` })
      : new HttpHeaders();
  }

  crearPlan(dto: CrearPlanDto): Observable<PlanNutricional> {
    return this.http.post<PlanNutricional>(
      `${this.API}/nutrition/planes`,
      dto,
      { headers: this.headers() }
    );
  }

  getPlanesCliente(clienteId: string): Observable<PlanNutricional[]> {
    return this.http.get<PlanNutricional[]>(
      `${this.API}/nutrition/planes/cliente/${clienteId}`,
      { headers: this.headers() }
    );
  }

  agregarComida(planId: string, dto: AgregarComidaDto): Observable<Comida> {
    return this.http.post<Comida>(
      `${this.API}/nutrition/planes/${planId}/comidas`,
      dto,
      { headers: this.headers() }
    );
  }

  agregarAlimento(mealId: string, dto: AgregarAlimentoDto): Observable<Alimento> {
    return this.http.post<Alimento>(
      `${this.API}/nutrition/comidas/${mealId}/alimentos`,
      dto,
      { headers: this.headers() }
    );
  }
}
