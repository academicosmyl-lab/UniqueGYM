import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Routine } from './routine.entity';
import { RoutineExercise } from './routine-exercise.entity';

@Entity('routine_days')
export class RoutineDay {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'routine_id' })
  routine_id: string;

  @ManyToOne(() => Routine, (routine) => routine.days, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'routine_id' })
  routine: Routine;

  @Column({ type: 'varchar', length: 80 })
  nombre: string;

  @Column({ type: 'int', default: 1 })
  orden: number;

  @Column({ type: 'int', name: 'dia_semana', nullable: true })
  dia_semana: number | null;

  @OneToMany(() => RoutineExercise, (re) => re.day, { cascade: true })
  exercises: RoutineExercise[];
}
