import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AlertaDashboard {
  clienteId: string;
  nombre: string;
  tipo: 'sin_actividad' | 'baja_adherencia' | 'grasa_aumentando';
  mensaje: string;
}

export interface DashboardData {
  clientesActivos: number;
  adherenciaPromedio: number;
  alertas: AlertaDashboard[];
}

export interface TendenciaMetrica {
  values: number[];
  suavizado: number[];
  pendiente: number;
}

export interface ComposicionClienteData {
  labels: string[];
  peso: TendenciaMetrica;
  grasa: TendenciaMetrica;
  tendencia: 'mejorando' | 'estable' | 'empeorando';
}

export interface RecordEjercicio {
  ejercicio: string;
  peso: number;
  reps: number;
  fecha: string;
}

export interface EntrenamientoClienteData {
  adherencia: number;
  volumenPorSesion: {
    labels: string[];
    values: number[];
  };
  records: RecordEjercicio[];
}

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private readonly http = inject(HttpClient);
  private readonly API = 'https://uniquegym.onrender.com/api/v1';

  getDashboard(): Observable<DashboardData> {
    return this.http.get<DashboardData>(`${this.API}/analytics/dashboard`);
  }

  getComposicionCliente(clienteId: string): Observable<ComposicionClienteData> {
    return this.http.get<ComposicionClienteData>(
      `${this.API}/analytics/cliente/${clienteId}/composicion`
    );
  }

  getEntrenamientoCliente(clienteId: string): Observable<EntrenamientoClienteData> {
    return this.http.get<EntrenamientoClienteData>(
      `${this.API}/analytics/cliente/${clienteId}/entrenamiento`
    );
  }
}
