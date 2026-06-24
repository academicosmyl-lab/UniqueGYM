import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, IsNull, Repository } from 'typeorm';
import { Routine } from './entities/routine.entity';
import { RoutineDay } from './entities/routine-day.entity';
import { RoutineExercise } from './entities/routine-exercise.entity';
import { CreateRoutineDto } from './dto/create-routine.dto';
import { UpdateRoutineDto } from './dto/update-routine.dto';
import { CreateRoutineDayDto } from './dto/create-routine-day.dto';
import { CreateRoutineExerciseDto } from './dto/create-routine-exercise.dto';
import { FindRoutinesDto } from './dto/find-routines.dto';

@Injectable()
export class RoutinesService {
  constructor(
    @InjectRepository(Routine)
    private readonly routineRepo: Repository<Routine>,

    @InjectRepository(RoutineDay)
    private readonly dayRepo: Repository<RoutineDay>,

    @InjectRepository(RoutineExercise)
    private readonly exerciseRepo: Repository<RoutineExercise>,

    private readonly dataSource: DataSource,
  ) {}

  // ---------------------------------------------------------------------------
  // Domain validations (calculos.md §3)
  // ---------------------------------------------------------------------------
  private validateRoutineDto(dto: CreateRoutineDto): void {
    if (!dto.days || dto.days.length === 0) return;  // days es opcional ahora

    for (const day of dto.days) {
      if (!day.exercises || day.exercises.length < 1) {
        throw new BadRequestException(
          `El día "${day.nombre}" debe tener al menos 1 ejercicio.`,
        );
      }

      for (const ex of day.exercises) {
        if (ex.series < 1) {
          throw new BadRequestException(
            `El ejercicio con exercise_id "${ex.exercise_id}" debe tener series >= 1.`,
          );
        }

        if (
          ex.reps_min !== undefined &&
          ex.reps_max !== undefined &&
          ex.reps_min > ex.reps_max
        ) {
          throw new BadRequestException(
            `Para el ejercicio con exercise_id "${ex.exercise_id}": reps_min (${ex.reps_min}) no puede ser mayor que reps_max (${ex.reps_max}).`,
          );
        }
      }
    }
  }

  private validateDayDto(dto: CreateRoutineDayDto): void {
    if (!dto.exercises || dto.exercises.length < 1) {
      throw new BadRequestException(
        `El día "${dto.nombre}" debe tener al menos 1 ejercicio.`,
      );
    }

    for (const ex of dto.exercises) {
      if (ex.series < 1) {
        throw new BadRequestException(
          `El ejercicio con exercise_id "${ex.exercise_id}" debe tener series >= 1.`,
        );
      }

      if (
        ex.reps_min !== undefined &&
        ex.reps_max !== undefined &&
        ex.reps_min > ex.reps_max
      ) {
        throw new BadRequestException(
          `Para el ejercicio con exercise_id "${ex.exercise_id}": reps_min (${ex.reps_min}) no puede ser mayor que reps_max (${ex.reps_max}).`,
        );
      }
    }
  }

  // ---------------------------------------------------------------------------
  // findAll
  // ---------------------------------------------------------------------------
  async findAll(
    gymId: string,
    filters: FindRoutinesDto = {},
  ): Promise<{ data: Routine[]; total: number; page: number; limit: number }> {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 20;
    const skip = (page - 1) * limit;

    const qb = this.routineRepo
      .createQueryBuilder('r')
      .where('r.gym_id = :gymId', { gymId })
      .andWhere('r.deleted_at IS NULL')
      .leftJoinAndSelect('r.days', 'day')
      .leftJoinAndSelect('day.exercises', 're')
      .leftJoinAndSelect('re.exercise', 'ex')
      .orderBy('r.created_at', 'DESC')
      .addOrderBy('day.orden', 'ASC')
      .addOrderBy('re.orden', 'ASC')
      .skip(skip)
      .take(limit);

    if (filters.cliente_id !== undefined) {
      qb.andWhere('r.cliente_id = :clienteId', {
        clienteId: filters.cliente_id,
      });
    }

    if (filters.es_plantilla !== undefined) {
      qb.andWhere('r.es_plantilla = :esPlantilla', {
        esPlantilla: filters.es_plantilla,
      });
    }

    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit };
  }

  // ---------------------------------------------------------------------------
  // findOne
  // ---------------------------------------------------------------------------
  async findOne(id: string, gymId: string): Promise<Routine> {
    const routine = await this.routineRepo
      .createQueryBuilder('r')
      .where('r.id = :id', { id })
      .andWhere('r.gym_id = :gymId', { gymId })
      .andWhere('r.deleted_at IS NULL')
      .leftJoinAndSelect('r.days', 'day')
      .leftJoinAndSelect('day.exercises', 're')
      .leftJoinAndSelect('re.exercise', 'ex')
      .orderBy('day.orden', 'ASC')
      .addOrderBy('re.orden', 'ASC')
      .getOne();

    if (!routine) {
      throw new NotFoundException(`Rutina con id "${id}" no encontrada.`);
    }

    return routine;
  }

  // ---------------------------------------------------------------------------
  // findToday
  // ---------------------------------------------------------------------------
  async findToday(
    clienteId: string,
    gymId: string,
  ): Promise<RoutineDay | null> {
    // Buscar rutina activa del cliente
    const routine = await this.routineRepo
      .createQueryBuilder('r')
      .where('r.gym_id = :gymId', { gymId })
      .andWhere('r.cliente_id = :clienteId', { clienteId })
      .andWhere('r.activa = true')
      .andWhere('r.deleted_at IS NULL')
      .leftJoinAndSelect('r.days', 'day')
      .leftJoinAndSelect('day.exercises', 're')
      .leftJoinAndSelect('re.exercise', 'ex')
      .orderBy('day.orden', 'ASC')
      .addOrderBy('re.orden', 'ASC')
      .getOne();

    if (!routine || !routine.days || routine.days.length === 0) {
      return null;
    }

    const todayDow = new Date().getDay(); // 0=Domingo ... 6=Sábado

    // Prioridad: buscar día con dia_semana exacto
    const exactDay = routine.days.find((d) => d.dia_semana === todayDow);
    if (exactDay) {
      return exactDay;
    }

    // Si ningún día tiene dia_semana asignado, devolver el primero por orden
    const allWithoutFixed = routine.days.every((d) => d.dia_semana === null);
    if (allWithoutFixed) {
      return routine.days[0];
    }

    return null;
  }

  // ---------------------------------------------------------------------------
  // create
  // ---------------------------------------------------------------------------
  async create(
    dto: CreateRoutineDto,
    gymId: string,
    creadaPor: string,
  ): Promise<Routine> {
    this.validateRoutineDto(dto);

    const routine = await this.dataSource.transaction(async (manager) => {
      // 1. Persist routine
      const newRoutine = manager.create(Routine, {
        gym_id: gymId,
        creada_por: creadaPor,
        cliente_id: dto.cliente_id ?? null,
        nombre: dto.nombre,
        objetivo: dto.objetivo ?? null,
        semanas: dto.semanas ?? 4,
        es_plantilla: dto.es_plantilla ?? false,
        activa: true,
      });
      const savedRoutine = await manager.save(Routine, newRoutine);

      // 2. Persist days and exercises
      for (const dayDto of (dto.days ?? [])) {
        const newDay = manager.create(RoutineDay, {
          routine_id: savedRoutine.id,
          nombre: dayDto.nombre,
          orden: dayDto.orden ?? 1,
          dia_semana: dayDto.dia_semana ?? null,
        });
        const savedDay = await manager.save(RoutineDay, newDay);

        for (const exDto of dayDto.exercises) {
          const newEx = manager.create(RoutineExercise, {
            routine_day_id: savedDay.id,
            exercise_id: exDto.exercise_id,
            orden: exDto.orden ?? 1,
            series: exDto.series,
            reps_min: exDto.reps_min ?? null,
            reps_max: exDto.reps_max ?? null,
            peso_sugerido: exDto.peso_sugerido ?? null,
            descanso_seg: exDto.descanso_seg ?? 90,
            notas: exDto.notas ?? null,
          });
          await manager.save(RoutineExercise, newEx);
        }
      }

      return savedRoutine;
    });

    // Return the full routine with relations
    return this.findOne(routine.id, gymId);
  }

  // ---------------------------------------------------------------------------
  // update
  // ---------------------------------------------------------------------------
  async update(
    id: string,
    dto: UpdateRoutineDto,
    gymId: string,
  ): Promise<Routine> {
    const routine = await this.findOne(id, gymId);

    if (dto.nombre !== undefined) routine.nombre = dto.nombre;
    if (dto.objetivo !== undefined) routine.objetivo = dto.objetivo ?? null;
    if (dto.semanas !== undefined) routine.semanas = dto.semanas;
    if (dto.es_plantilla !== undefined) routine.es_plantilla = dto.es_plantilla;
    if (dto.activa !== undefined) routine.activa = dto.activa;
    if (dto.cliente_id !== undefined) routine.cliente_id = dto.cliente_id ?? null;

    await this.routineRepo.save(routine);
    return this.findOne(id, gymId);
  }

  // ---------------------------------------------------------------------------
  // addDay
  // ---------------------------------------------------------------------------
  async addDay(
    routineId: string,
    dto: CreateRoutineDayDto,
    gymId: string,
  ): Promise<RoutineDay> {
    // Verify routine exists and belongs to gym
    await this.findOne(routineId, gymId);

    this.validateDayDto(dto);

    const savedDay = await this.dataSource.transaction(async (manager) => {
      const newDay = manager.create(RoutineDay, {
        routine_id: routineId,
        nombre: dto.nombre,
        orden: dto.orden ?? 1,
        dia_semana: dto.dia_semana ?? null,
      });
      const day = await manager.save(RoutineDay, newDay);

      for (const exDto of dto.exercises) {
        const newEx = manager.create(RoutineExercise, {
          routine_day_id: day.id,
          exercise_id: exDto.exercise_id,
          orden: exDto.orden ?? 1,
          series: exDto.series,
          reps_min: exDto.reps_min ?? null,
          reps_max: exDto.reps_max ?? null,
          peso_sugerido: exDto.peso_sugerido ?? null,
          descanso_seg: exDto.descanso_seg ?? 90,
          notas: exDto.notas ?? null,
        });
        await manager.save(RoutineExercise, newEx);
      }

      return day;
    });

    // Return day with exercises loaded
    const fullDay = await this.dayRepo.findOne({
      where: { id: savedDay.id },
      relations: ['exercises', 'exercises.exercise'],
      order: { exercises: { orden: 'ASC' } },
    });

    if (!fullDay) {
      throw new NotFoundException(`Día recién creado no encontrado.`);
    }

    return fullDay;
  }

  // ---------------------------------------------------------------------------
  // removeDay
  // ---------------------------------------------------------------------------
  async removeDay(
    routineId: string,
    dayId: string,
    gymId: string,
  ): Promise<void> {
    // Verify routine exists and belongs to gym
    await this.findOne(routineId, gymId);

    const day = await this.dayRepo.findOne({
      where: { id: dayId, routine_id: routineId },
    });

    if (!day) {
      throw new NotFoundException(
        `Día con id "${dayId}" no encontrado en la rutina "${routineId}".`,
      );
    }

    await this.dayRepo.remove(day);
  }

  // ---------------------------------------------------------------------------
  // remove (soft-delete)
  // ---------------------------------------------------------------------------
  async remove(id: string, gymId: string): Promise<void> {
    const routine = await this.routineRepo.findOne({
      where: { id, gym_id: gymId, deleted_at: IsNull() },
    });

    if (!routine) {
      throw new NotFoundException(`Rutina con id "${id}" no encontrada.`);
    }

    await this.routineRepo.softDelete(id);
  }

  // ---------------------------------------------------------------------------
  // addExerciseToDay
  // ---------------------------------------------------------------------------
  async addExerciseToDay(
    routineId: string,
    dayId: string,
    dto: CreateRoutineExerciseDto,
    gymId: string,
  ): Promise<RoutineExercise> {
    await this.findOne(routineId, gymId);

    const day = await this.dayRepo.findOne({
      where: { id: dayId, routine_id: routineId },
    });
    if (!day) {
      throw new NotFoundException(`Día "${dayId}" no encontrado en la rutina.`);
    }

    if (dto.series < 1) {
      throw new BadRequestException('series debe ser >= 1');
    }

    const ex = this.exerciseRepo.create({
      routine_day_id: dayId,
      exercise_id: dto.exercise_id,
      orden: dto.orden ?? 1,
      series: dto.series,
      reps_min: dto.reps_min ?? null,
      reps_max: dto.reps_max ?? null,
      peso_sugerido: dto.peso_sugerido ?? null,
      descanso_seg: dto.descanso_seg ?? 90,
      notas: dto.notas ?? null,
    });

    return this.exerciseRepo.save(ex);
  }

  // ---------------------------------------------------------------------------
  // removeExerciseFromDay
  // ---------------------------------------------------------------------------
  async removeExerciseFromDay(
    routineId: string,
    dayId: string,
    exerciseId: string,
    gymId: string,
  ): Promise<void> {
    await this.findOne(routineId, gymId);

    const ex = await this.exerciseRepo.findOne({
      where: { id: exerciseId, routine_day_id: dayId },
    });
    if (!ex) {
      throw new NotFoundException(
        `Ejercicio "${exerciseId}" no encontrado en el día "${dayId}".`,
      );
    }

    await this.exerciseRepo.remove(ex);
  }
}
