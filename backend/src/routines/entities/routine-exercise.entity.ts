import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { RoutineDay } from './routine-day.entity';
import { Exercise } from '../../exercises/entities/exercise.entity';

@Entity('routine_exercises')
export class RoutineExercise {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'routine_day_id' })
  routine_day_id: string;

  @ManyToOne(() => RoutineDay, (day) => day.exercises, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'routine_day_id' })
  day: RoutineDay;

  @Column({ type: 'uuid', name: 'exercise_id' })
  exercise_id: string;

  @ManyToOne(() => Exercise, { nullable: false, eager: false })
  @JoinColumn({ name: 'exercise_id' })
  exercise: Exercise;

  @Column({ type: 'int', default: 1 })
  orden: number;

  @Column({ type: 'int', default: 3 })
  series: number;

  @Column({ type: 'int', name: 'reps_min', nullable: true })
  reps_min: number | null;

  @Column({ type: 'int', name: 'reps_max', nullable: true })
  reps_max: number | null;

  @Column({
    type: 'numeric',
    precision: 6,
    scale: 2,
    name: 'peso_sugerido',
    nullable: true,
  })
  peso_sugerido: number | null;

  @Column({ type: 'int', name: 'descanso_seg', default: 90 })
  descanso_seg: number;

  @Column({ type: 'text', nullable: true })
  notas: string | null;
}
