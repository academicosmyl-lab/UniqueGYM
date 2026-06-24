import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const API_URL = 'https://uniquegym.onrender.com/api/v1';

export interface SerieMetrica {
  values: number[];
  suavizado: number[];
  pendiente: number;
}

export interface ProgresoComposicion {
  labels: string[];
  peso: SerieMetrica;
  grasa: SerieMetrica;
  tendencia: 'mejorando' | 'estable' | 'empeorando';
}

export interface RecordPersonal {
  ejercicio: string;
  peso: number;
  reps: number;
  fecha: string;
}

export interface ProgresoEntrenamiento {
  adherencia: number;
  volumenPorSesion: {
    labels: string[];
    values: number[];
  };
  records: RecordPersonal[];
}

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  constructor(private http: HttpClient) {}

  getMiProgresoComposicion(): Observable<ProgresoComposicion> {
    return this.http.get<ProgresoComposicion>(
      `${API_URL}/analytics/mi-progreso/composicion`
    );
  }

  getMiProgresoEntrenamiento(): Observable<ProgresoEntrenamiento> {
    return this.http.get<ProgresoEntrenamiento>(
      `${API_URL}/analytics/mi-progreso/entrenamiento`
    );
  }
}
