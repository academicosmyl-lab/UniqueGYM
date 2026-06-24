import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BodyComposition } from '../body-composition/body-composition.entity';
import { WorkoutSession } from '../workout-sessions/entities/workout-session.entity';
import { WorkoutSetLog } from '../workout-sessions/entities/workout-set-log.entity';
import { User } from '../users/entities/user.entity';
import {
  mediana,
  mad,
  esAtipica,
  mediaMovil,
  pendienteLineal,
  epley,
} from './stats.utils';

const MIN_MEDICIONES = 3;

type Tendencia = 'mejorando' | 'estable' | 'empeorando';

interface SerieComposicion {
  labels: string[];
  peso: {
    values: number[];
    suavizado: number[];
    pendiente: number;
  };
  grasa: {
    values: number[];
    suavizado: number[];
    pendiente: number;
  };
  tendencia: Tendencia;
  mensaje?: string;
}

interface Record1RM {
  exercise_id: string;
  nombre: string;
  rm_estimado: number;
}

interface SerieEntrenamiento {
  labels: string[];
  volumen: number[];
  adherencia_pct: number;
  records_1rm: Record1RM[];
  mensaje?: string;
}

interface AlertaCliente {
  cliente_id: string;
  tipo: 'Sin actividad' | 'Baja adherencia' | '% grasa aumentando';
  mensaje: string;
}

interface DashboardAdmin {
  clientes_activos: number;
  adherencia_promedio_pct: number;
  alertas: AlertaCliente[];
}

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(BodyComposition)
    private readonly bodyRepo: Repository<BodyComposition>,

    @InjectRepository(WorkoutSession)
    private readonly sessionRepo: Repository<WorkoutSession>,

    @InjectRepository(WorkoutSetLog)
    private readonly setLogRepo: Repository<WorkoutSetLog>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async progresoComposicion(clienteId: string): Promise<SerieComposicion> {
    const mediciones = await this.bodyRepo.find({
      where: { cliente_id: clienteId },
      order: { fecha: 'ASC' },
      take: 20,
    });

    const conPeso = mediciones.filter((m) => m.peso_kg !== null);
    const conGrasa = mediciones.filter((m) => m.grasa_pct !== null);

    if (conPeso.length < MIN_MEDICIONES && conGrasa.length < MIN_MEDICIONES) {
      return {
        labels: [],
        peso: { values: [], suavizado: [], pendiente: 0 },
        grasa: { values: [], suavizado: [], pendiente: 0 },
        tendencia: 'estable',
        mensaje: 'Insuficientes datos',
      };
    }

    const pesoBase = conPeso.length >= MIN_MEDICIONES ? conPeso : [];
    const grasaBase = conGrasa.length >= MIN_MEDICIONES ? conGrasa : [];

    const labelsSet = new Set<string>();
    pesoBase.forEach((m) => labelsSet.add(m.fecha.toISOString().slice(0, 10)));
    grasaBase.forEach((m) => labelsSet.add(m.fecha.toISOString().slice(0, 10)));
    const labels = Array.from(labelsSet).sort();

    const pesoValues = pesoBase.map((m) => Number(m.peso_kg));
    const grasaValues = grasaBase.map((m) => Number(m.grasa_pct));

    const pesoSuavizado = pesoValues.length >= MIN_MEDICIONES ? mediaMovil(pesoValues) : [];
    const grasaSuavizado = grasaValues.length >= MIN_MEDICIONES ? mediaMovil(grasaValues) : [];

    const pesoPendiente = pesoValues.length >= 2 ? pendienteLineal(pesoValues) : 0;
    const grasaPendiente = grasaValues.length >= 2 ? pendienteLineal(grasaValues) : 0;

    const tendencia = this.calcularTendenciaComposicion(pesoPendiente, grasaPendiente);

    return {
      labels,
      peso: {
        values: pesoValues,
        suavizado: pesoSuavizado,
        pendiente: Number(pesoPendiente.toFixed(4)),
      },
      grasa: {
        values: grasaValues,
        suavizado: grasaSuavizado,
        pendiente: Number(grasaPendiente.toFixed(4)),
      },
      tendencia,
    };
  }

  private calcularTendenciaComposicion(
    pesoPendiente: number,
    grasaPendiente: number,
  ): Tendencia {
    const umbral = 0.01;
    if (grasaPendiente < -umbral) return 'mejorando';
    if (grasaPendiente > umbral) return 'empeorando';
    return 'estable';
  }

  async progresoEntrenamiento(clienteId: string): Promise<SerieEntrenamiento> {
    const sesiones = await this.sessionRepo.find({
      where: { cliente_id: clienteId },
      order: { fecha: 'ASC' },
    });

    if (sesiones.length < MIN_MEDICIONES) {
      return {
        labels: [],
        volumen: [],
        adherencia_pct: 0,
        records_1rm: [],
        mensaje: 'Insuficientes datos',
      };
    }

    const labels = sesiones
      .filter((s) => s.completada)
      .map((s) => s.fecha.toISOString().slice(0, 10));

    const volumen = sesiones
      .filter((s) => s.completada)
      .map((s) => Number(s.volumen_total ?? 0));

    const ahora = new Date();
    const hace30 = new Date(ahora.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sesionesMes = sesiones.filter((s) => new Date(s.fecha) >= hace30);
    const completadasMes = sesionesMes.filter((s) => s.completada).length;
    const adherencia_pct =
      sesionesMes.length > 0
        ? Math.round((completadasMes / sesionesMes.length) * 100)
        : 0;

    const setLogs = await this.setLogRepo
      .createQueryBuilder('sl')
      .innerJoin('sl.session', 's')
      .leftJoinAndSelect('sl.exercise', 'ex')
      .where('s.cliente_id = :clienteId', { clienteId })
      .andWhere('sl.completada = true')
      .andWhere('sl.peso IS NOT NULL')
      .andWhere('sl.reps IS NOT NULL')
      .getMany();

    const rmMap = new Map<string, { nombre: string; rm: number }>();
    for (const log of setLogs) {
      const rm1 = epley(Number(log.peso), Number(log.reps));
      const existente = rmMap.get(log.exercise_id);
      const nombre = log.exercise?.nombre ?? log.exercise_id;
      if (!existente || rm1 > existente.rm) {
        rmMap.set(log.exercise_id, { nombre, rm: rm1 });
      }
    }

    const records_1rm: Record1RM[] = Array.from(rmMap.entries()).map(
      ([exercise_id, { nombre, rm }]) => ({
        exercise_id,
        nombre,
        rm_estimado: Number(rm.toFixed(2)),
      }),
    );

    return {
      labels,
      volumen,
      adherencia_pct,
      records_1rm,
    };
  }

  async dashboardAdmin(gymId: string): Promise<DashboardAdmin> {
    const ahora = new Date();
    const hace30 = new Date(ahora.getTime() - 30 * 24 * 60 * 60 * 1000);
    const hace14 = new Date(ahora.getTime() - 14 * 24 * 60 * 60 * 1000);

    const clientes = await this.userRepo
      .createQueryBuilder('u')
      .where('u.gym_id = :gymId', { gymId })
      .andWhere('u.role = :role', { role: 'CLIENTE' })
      .andWhere('u.activo = true')
      .andWhere('u.deleted_at IS NULL')
      .getMany();

    const clienteIds = clientes.map((c) => c.id);

    if (clienteIds.length === 0) {
      return { clientes_activos: 0, adherencia_promedio_pct: 0, alertas: [] };
    }

    const sesionesRecientes = await this.sessionRepo
      .createQueryBuilder('s')
      .where('s.cliente_id IN (:...ids)', { ids: clienteIds })
      .andWhere('s.fecha >= :desde', { desde: hace30 })
      .getMany();

    const bodyRecientes = await this.bodyRepo
      .createQueryBuilder('b')
      .where('b.cliente_id IN (:...ids)', { ids: clienteIds })
      .andWhere('b.fecha >= :desde', { desde: hace30 })
      .getMany();

    const clientesActivosSet = new Set<string>();
    sesionesRecientes.forEach((s) => clientesActivosSet.add(s.cliente_id));
    bodyRecientes.forEach((b) => clientesActivosSet.add(b.cliente_id));

    const clientes_activos = clientesActivosSet.size;

    const adherenciasPorCliente: number[] = [];
    for (const clienteId of clienteIds) {
      const sesionesMes = sesionesRecientes.filter(
        (s) => s.cliente_id === clienteId,
      );
      if (sesionesMes.length > 0) {
        const completadas = sesionesMes.filter((s) => s.completada).length;
        adherenciasPorCliente.push((completadas / sesionesMes.length) * 100);
      }
    }

    const adherencia_promedio_pct =
      adherenciasPorCliente.length > 0
        ? Math.round(
            adherenciasPorCliente.reduce((s, v) => s + v, 0) /
              adherenciasPorCliente.length,
          )
        : 0;

    const alertas: AlertaCliente[] = [];

    const ultimaSesionPorCliente = new Map<string, Date>();
    sesionesRecientes.forEach((s) => {
      const prev = ultimaSesionPorCliente.get(s.cliente_id);
      const fecha = new Date(s.fecha);
      if (!prev || fecha > prev) {
        ultimaSesionPorCliente.set(s.cliente_id, fecha);
      }
    });

    for (const clienteId of clienteIds) {
      const ultimaSesion = ultimaSesionPorCliente.get(clienteId);
      if (!ultimaSesion || ultimaSesion < hace14) {
        alertas.push({
          cliente_id: clienteId,
          tipo: 'Sin actividad',
          mensaje: 'Sin actividad registrada en los últimos 14 días',
        });
      }
    }

    for (const clienteId of clienteIds) {
      const sesionesMes = sesionesRecientes.filter(
        (s) => s.cliente_id === clienteId,
      );
      if (sesionesMes.length > 0) {
        const completadas = sesionesMes.filter((s) => s.completada).length;
        const adherencia = (completadas / sesionesMes.length) * 100;
        if (adherencia < 50) {
          alertas.push({
            cliente_id: clienteId,
            tipo: 'Baja adherencia',
            mensaje: `Adherencia del ${Math.round(adherencia)}% en los últimos 30 días`,
          });
        }
      }
    }

    for (const clienteId of clienteIds) {
      const mediciones = await this.bodyRepo.find({
        where: { cliente_id: clienteId },
        order: { fecha: 'ASC' },
        take: 10,
      });
      const conGrasa = mediciones.filter((m) => m.grasa_pct !== null);
      if (conGrasa.length >= MIN_MEDICIONES) {
        const grasaValues = conGrasa.map((m) => Number(m.grasa_pct));
        const pendiente = pendienteLineal(grasaValues);
        if (pendiente > 0.05) {
          alertas.push({
            cliente_id: clienteId,
            tipo: '% grasa aumentando',
            mensaje: 'Tendencia creciente en porcentaje de grasa corporal',
          });
        }
      }
    }

    return { clientes_activos, adherencia_promedio_pct, alertas };
  }

  async marcarAtipicas(clienteId: string): Promise<{ actualizadas: number }> {
    const mediciones = await this.bodyRepo.find({
      where: { cliente_id: clienteId },
      order: { fecha: 'ASC' },
    });

    const conPeso = mediciones.filter((m) => m.peso_kg !== null);
    if (conPeso.length < MIN_MEDICIONES) {
      return { actualizadas: 0 };
    }

    const pesos = conPeso.map((m) => Number(m.peso_kg));
    let actualizadas = 0;

    for (const medicion of conPeso) {
      const atipica = esAtipica(Number(medicion.peso_kg), pesos);
      if (medicion.es_atipica !== atipica) {
        medicion.es_atipica = atipica;
        await this.bodyRepo.save(medicion);
        actualizadas++;
      }
    }

    return { actualizadas };
  }
}
