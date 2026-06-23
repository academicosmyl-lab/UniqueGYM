import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WorkoutSession } from './entities/workout-session.entity';
import { WorkoutSetLog } from './entities/workout-set-log.entity';
import { RoutineDay } from '../routines/entities/routine-day.entity';
import { CreateSessionDto } from './dto/create-session.dto';
import { LogSetDto } from './dto/log-set.dto';
import { CompleteSessionDto } from './dto/complete-session.dto';
import { SessionFilterDto } from './dto/session-filter.dto';

@Injectable()
export class WorkoutSessionsService {
  constructor(
    @InjectRepository(WorkoutSession)
    private readonly sessionRepo: Repository<WorkoutSession>,

    @InjectRepository(WorkoutSetLog)
    private readonly setLogRepo: Repository<WorkoutSetLog>,

    @InjectRepository(RoutineDay)
    private readonly routineDayRepo: Repository<RoutineDay>,
  ) {}

  // ---------------------------------------------------------------------------
  // startSession
  // ---------------------------------------------------------------------------
  async startSession(
    clienteId: string,
    dto: CreateSessionDto,
  ): Promise<WorkoutSession> {
    if (dto.routine_day_id) {
      const dayExists = await this.routineDayRepo.findOne({
        where: { id: dto.routine_day_id },
      });
      if (!dayExists) {
        throw new NotFoundException(
          `El día de rutina con id "${dto.routine_day_id}" no existe.`,
        );
      }
    }

    const session = this.sessionRepo.create({
      cliente_id: clienteId,
      routine_day_id: dto.routine_day_id ?? null,
      fecha: dto.fecha ? new Date(dto.fecha) : new Date(),
      nota_cliente: dto.nota_cliente ?? null,
      completada: false,
      duracion_min: null,
      volumen_total: null,
    });

    return this.sessionRepo.save(session);
  }

  // ---------------------------------------------------------------------------
  // logSet
  // ---------------------------------------------------------------------------
  async logSet(
    sessionId: string,
    clienteId: string,
    dto: LogSetDto,
  ): Promise<WorkoutSetLog> {
    const session = await this.sessionRepo.findOne({
      where: { id: sessionId, cliente_id: clienteId },
    });

    if (!session) {
      throw new NotFoundException(
        `Sesión con id "${sessionId}" no encontrada o no pertenece al cliente.`,
      );
    }

    if (session.completada) {
      throw new BadRequestException(
        `La sesión "${sessionId}" ya está completada y no admite nuevas series.`,
      );
    }

    const setLog = this.setLogRepo.create({
      session_id: sessionId,
      exercise_id: dto.exercise_id,
      numero_serie: dto.numero_serie,
      peso: dto.peso ?? null,
      reps: dto.reps ?? null,
      rpe: dto.rpe ?? null,
      completada: dto.completada ?? true,
    });

    return this.setLogRepo.save(setLog);
  }

  // ---------------------------------------------------------------------------
  // completeSession
  // ---------------------------------------------------------------------------
  async completeSession(
    sessionId: string,
    clienteId: string,
    dto: CompleteSessionDto,
  ): Promise<WorkoutSession> {
    const session = await this.sessionRepo.findOne({
      where: { id: sessionId, cliente_id: clienteId },
      relations: ['set_logs'],
    });

    if (!session) {
      throw new NotFoundException(
        `Sesión con id "${sessionId}" no encontrada o no pertenece al cliente.`,
      );
    }

    if (session.completada) {
      throw new BadRequestException(
        `La sesión "${sessionId}" ya está completada.`,
      );
    }

    // Calcular volumen_total: SUM(peso * reps) solo sets completados con peso y reps
    const volumen = session.set_logs
      .filter(
        (s) =>
          s.completada &&
          s.peso !== null &&
          s.peso !== undefined &&
          s.reps !== null &&
          s.reps !== undefined,
      )
      .reduce((acc, s) => acc + Number(s.peso) * Number(s.reps), 0);

    // Calcular duracion_min: diferencia en minutos redondeada
    const now = new Date();
    const diffMs = now.getTime() - new Date(session.fecha).getTime();
    const duracion = Math.round(diffMs / 60000);

    session.completada = true;
    session.volumen_total = volumen;
    session.duracion_min = duracion;
    if (dto.nota_cliente !== undefined) {
      session.nota_cliente = dto.nota_cliente;
    }

    await this.sessionRepo.save(session);

    // Return with set_logs including exercise.nombre
    return this.findOne(sessionId, clienteId);
  }

  // ---------------------------------------------------------------------------
  // findHistory
  // ---------------------------------------------------------------------------
  async findHistory(
    clienteId: string,
    filters: SessionFilterDto,
  ): Promise<{
    data: WorkoutSession[];
    total: number;
    page: number;
    limit: number;
  }> {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 20;
    const skip = (page - 1) * limit;

    const qb = this.sessionRepo
      .createQueryBuilder('s')
      .where('s.cliente_id = :clienteId', { clienteId })
      .orderBy('s.fecha', 'DESC')
      .skip(skip)
      .take(limit);

    if (filters.desde) {
      qb.andWhere('s.fecha >= :desde', { desde: filters.desde });
    }

    if (filters.hasta) {
      qb.andWhere('s.fecha <= :hasta', { hasta: filters.hasta });
    }

    if (filters.completada !== undefined) {
      qb.andWhere('s.completada = :completada', {
        completada: filters.completada,
      });
    }

    const [data, total] = await qb.getManyAndCount();

    return { data, total, page, limit };
  }

  // ---------------------------------------------------------------------------
  // findOne
  // ---------------------------------------------------------------------------
  async findOne(sessionId: string, clienteId: string): Promise<WorkoutSession> {
    const session = await this.sessionRepo
      .createQueryBuilder('s')
      .where('s.id = :sessionId', { sessionId })
      .andWhere('s.cliente_id = :clienteId', { clienteId })
      .leftJoinAndSelect('s.set_logs', 'sl')
      .leftJoinAndSelect('sl.exercise', 'ex')
      .orderBy('sl.numero_serie', 'ASC')
      .getOne();

    if (!session) {
      throw new NotFoundException(
        `Sesión con id "${sessionId}" no encontrada o no pertenece al cliente.`,
      );
    }

    return session;
  }
}
