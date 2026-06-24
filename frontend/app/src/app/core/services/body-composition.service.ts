import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const API_URL = 'https://uniquegym.onrender.com/api/v1';

export interface BodyComposition {
  id: string;
  fecha: string;
  fuente: 'PESA' | 'MANUAL';
  peso_kg: number | null;
  grasa_pct: number | null;
  agua_pct: number | null;
  musculo_kg: number | null;
  musculo_esqueletico_pct: number | null;
  hueso_kg: number | null;
  grasa_visceral: number | null;
  grasa_subcutanea_pct: number | null;
  proteina_pct: number | null;
  tmb_kcal: number | null;
  edad_metabolica: number | null;
  imc: number | null;
  masa_libre_grasa_kg: number | null;
  es_atipica: boolean;
  created_at: string;
}

export interface RegistrarMedicionDto {
  fecha?: string;
  fuente?: 'PESA' | 'MANUAL';
  peso_kg?: number | null;
  grasa_pct?: number | null;
  agua_pct?: number | null;
  musculo_kg?: number | null;
  musculo_esqueletico_pct?: number | null;
  hueso_kg?: number | null;
  grasa_visceral?: number | null;
  grasa_subcutanea_pct?: number | null;
  proteina_pct?: number | null;
  tmb_kcal?: number | null;
  edad_metabolica?: number | null;
  imc?: number | null;
  masa_libre_grasa_kg?: number | null;
}

@Injectable({ providedIn: 'root' })
export class BodyCompositionService {
  constructor(private http: HttpClient) {}

  registrar(dto: RegistrarMedicionDto): Observable<BodyComposition> {
    return this.http.post<BodyComposition>(
      `${API_URL}/body-composition/mi-medicion`,
      dto
    );
  }

  getMisMediciones(limit = 20): Observable<BodyComposition[]> {
    return this.http.get<BodyComposition[]>(
      `${API_URL}/body-composition/mis-mediciones?limit=${limit}`
    );
  }

  getMiUltima(): Observable<BodyComposition | null> {
    return this.http.get<BodyComposition | null>(
      `${API_URL}/body-composition/mi-ultima`
    );
  }
}
