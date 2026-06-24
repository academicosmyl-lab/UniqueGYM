import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface BodyComposition {
  id: string;
  cliente_id: string;
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
}

@Injectable({ providedIn: 'root' })
export class BodyCompositionService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);

  private readonly API = 'https://uniquegym.onrender.com/api/v1';

  private headers(): HttpHeaders {
    const token = this.auth.getToken();
    return token
      ? new HttpHeaders({ Authorization: `Bearer ${token}` })
      : new HttpHeaders();
  }

  getHistorialCliente(clienteId: string, limit = 20): Observable<BodyComposition[]> {
    return this.http.get<BodyComposition[]>(
      `${this.API}/body-composition/cliente/${clienteId}?limit=${limit}`,
      { headers: this.headers() }
    );
  }

  getUltimaCliente(clienteId: string): Observable<BodyComposition> {
    return this.http.get<BodyComposition>(
      `${this.API}/body-composition/cliente/${clienteId}/ultima`,
      { headers: this.headers() }
    );
  }
}
