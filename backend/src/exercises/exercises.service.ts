import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Exercise } from './entities/exercise.entity';
import { ExerciseMuscle } from './entities/exercise-muscle.entity';
import { MuscleGroup } from './entities/muscle-group.entity';
import { Equipment } from './entities/equipment.entity';
import { CreateExerciseDto } from './dto/create-exercise.dto';
import { UpdateExerciseDto } from './dto/update-exercise.dto';
import { ExerciseFilterDto } from './dto/exercise-filter.dto';

export interface PaginatedExercises {
  data: Exercise[];
  total: number;
  page: number;
  limit: number;
}

@Injectable()
export class ExercisesService {
  constructor(
    @InjectRepository(Exercise)
    private readonly exerciseRepo: Repository<Exercise>,

    @InjectRepository(ExerciseMuscle)
    private readonly exerciseMuscleRepo: Repository<ExerciseMuscle>,

    @InjectRepository(MuscleGroup)
    private readonly muscleGroupRepo: Repository<MuscleGroup>,

    @InjectRepository(Equipment)
    private readonly equipmentRepo: Repository<Equipment>,

    private readonly dataSource: DataSource,
  ) {}

  async findAll(gymId: string, filters: ExerciseFilterDto): Promise<PaginatedExercises> {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 20;
    const skip = (page - 1) * limit;

    const qb = this.exerciseRepo
      .createQueryBuilder('exercise')
      .leftJoinAndSelect('exercise.equipment', 'equipment')
      .leftJoinAndSelect('exercise.exercise_muscles', 'em')
      .leftJoinAndSelect('em.muscle', 'muscle')
      .where('exercise.gym_id = :gymId', { gymId })
      .andWhere('exercise.deleted_at IS NULL')
      .orderBy('exercise.created_at', 'DESC')
      .skip(skip)
      .take(limit);

    if (filters.search) {
      qb.andWhere('exercise.nombre ILIKE :search', {
        search: `%${filters.search}%`,
      });
    }

    if (filters.dificultad) {
      qb.andWhere('exercise.dificultad = :dificultad', {
        dificultad: filters.dificultad,
      });
    }

    if (filters.equipment_id) {
      qb.andWhere('exercise.equipment_id = :equipment_id', {
        equipment_id: filters.equipment_id,
      });
    }

    if (filters.muscle_id) {
      qb.andWhere((subQb) => {
        const sub = subQb
          .subQuery()
          .select('em2.exercise_id')
          .from(ExerciseMuscle, 'em2')
          .where('em2.muscle_id = :muscle_id')
          .getQuery();
        return `exercise.id IN ${sub}`;
      });
      qb.setParameter('muscle_id', filters.muscle_id);
    }

    const [data, total] = await qb.getManyAndCount();

    return { data, total, page, limit };
  }

  async findOne(id: string, gymId: string): Promise<Exercise> {
    const exercise = await this.exerciseRepo
      .createQueryBuilder('exercise')
      .leftJoinAndSelect('exercise.equipment', 'equipment')
      .leftJoinAndSelect('exercise.exercise_muscles', 'em')
      .leftJoinAndSelect('em.muscle', 'muscle')
      .where('exercise.id = :id', { id })
      .andWhere('exercise.gym_id = :gymId', { gymId })
      .andWhere('exercise.deleted_at IS NULL')
      .getOne();

    if (!exercise) {
      throw new NotFoundException(`Ejercicio con id ${id} no encontrado`);
    }

    return exercise;
  }

  async create(
    dto: CreateExerciseDto,
    gymId: string,
    createdBy: string,
  ): Promise<Exercise> {
    return this.dataSource.transaction(async (manager) => {
      const exercise = manager.create(Exercise, {
        gym_id: gymId,
        nombre: dto.nombre,
        descripcion: dto.descripcion ?? null,
        instrucciones: dto.instrucciones ?? null,
        video_url: dto.video_url ?? null,
        thumbnail_url: dto.thumbnail_url ?? null,
        equipment_id: dto.equipment_id ?? null,
        dificultad: dto.dificultad ?? 'INTERMEDIO',
        es_publico: dto.es_publico ?? true,
        created_by: createdBy,
      });

      const saved = await manager.save(Exercise, exercise);

      if (dto.muscle_ids && dto.muscle_ids.length > 0) {
        const muscles = dto.muscle_ids.map((m) =>
          manager.create(ExerciseMuscle, {
            exercise_id: saved.id,
            muscle_id: m.muscle_id,
            es_primario: m.es_primario,
          }),
        );
        await manager.save(ExerciseMuscle, muscles);
      }

      return this.findOne(saved.id, gymId);
    });
  }

  async update(
    id: string,
    dto: UpdateExerciseDto,
    gymId: string,
  ): Promise<Exercise> {
    const exercise = await this.findOne(id, gymId);

    return this.dataSource.transaction(async (manager) => {
      const updateFields: Partial<Exercise> = {};

      if (dto.nombre !== undefined) updateFields.nombre = dto.nombre;
      if (dto.descripcion !== undefined)
        updateFields.descripcion = dto.descripcion;
      if (dto.instrucciones !== undefined)
        updateFields.instrucciones = dto.instrucciones;
      if (dto.video_url !== undefined) updateFields.video_url = dto.video_url;
      if (dto.thumbnail_url !== undefined)
        updateFields.thumbnail_url = dto.thumbnail_url;
      if (dto.equipment_id !== undefined)
        updateFields.equipment_id = dto.equipment_id;
      if (dto.dificultad !== undefined) updateFields.dificultad = dto.dificultad;
      if (dto.es_publico !== undefined) updateFields.es_publico = dto.es_publico;

      if (Object.keys(updateFields).length > 0) {
        await manager.update(Exercise, exercise.id, updateFields);
      }

      if (dto.muscle_ids !== undefined) {
        await manager.delete(ExerciseMuscle, { exercise_id: exercise.id });

        if (dto.muscle_ids.length > 0) {
          const muscles = dto.muscle_ids.map((m) =>
            manager.create(ExerciseMuscle, {
              exercise_id: exercise.id,
              muscle_id: m.muscle_id,
              es_primario: m.es_primario,
            }),
          );
          await manager.save(ExerciseMuscle, muscles);
        }
      }

      return this.findOne(exercise.id, gymId);
    });
  }

  async remove(id: string, gymId: string): Promise<void> {
    const exercise = await this.findOne(id, gymId);
    await this.exerciseRepo.softDelete(exercise.id);
  }

  async findMuscleGroups(): Promise<MuscleGroup[]> {
    return this.muscleGroupRepo.find({ order: { nombre: 'ASC' } });
  }

  async findEquipment(): Promise<Equipment[]> {
    return this.equipmentRepo.find({ order: { nombre: 'ASC' } });
  }
}
