import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { Exercise } from './exercise.entity';
import { MuscleGroup } from './muscle-group.entity';

@Entity('exercise_muscles')
export class ExerciseMuscle {
  @PrimaryColumn({ type: 'uuid', name: 'exercise_id' })
  exercise_id: string;

  @PrimaryColumn({ type: 'uuid', name: 'muscle_id' })
  muscle_id: string;

  @Column({ type: 'boolean', name: 'es_primario', default: true })
  es_primario: boolean;

  @ManyToOne(() => Exercise, (exercise) => exercise.exercise_muscles, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'exercise_id' })
  exercise: Exercise;

  @ManyToOne(() => MuscleGroup, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'muscle_id' })
  muscle: MuscleGroup;
}
