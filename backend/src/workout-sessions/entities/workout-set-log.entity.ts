import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { WorkoutSession } from './workout-session.entity';
import { Exercise } from '../../exercises/entities/exercise.entity';

@Entity('workout_set_logs')
export class WorkoutSetLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'session_id' })
  session_id: string;

  @ManyToOne(() => WorkoutSession, (session) => session.set_logs, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'session_id' })
  session: WorkoutSession;

  @Column({ type: 'uuid', name: 'exercise_id' })
  exercise_id: string;

  @ManyToOne(() => Exercise, { nullable: false, eager: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'exercise_id' })
  exercise: Exercise;

  @Column({ type: 'int', name: 'numero_serie' })
  numero_serie: number;

  @Column({
    type: 'numeric',
    precision: 6,
    scale: 2,
    name: 'peso',
    nullable: true,
  })
  peso: number | null;

  @Column({ type: 'int', name: 'reps', nullable: true })
  reps: number | null;

  @Column({
    type: 'numeric',
    precision: 3,
    scale: 1,
    name: 'rpe',
    nullable: true,
  })
  rpe: number | null;

  @Column({ type: 'boolean', name: 'completada', default: true })
  completada: boolean;
}
