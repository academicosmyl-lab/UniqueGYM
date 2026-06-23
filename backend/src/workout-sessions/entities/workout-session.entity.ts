import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { RoutineDay } from '../../routines/entities/routine-day.entity';
import { WorkoutSetLog } from './workout-set-log.entity';

@Entity('workout_sessions')
export class WorkoutSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'cliente_id' })
  cliente_id: string;

  @ManyToOne(() => User, { nullable: false, eager: false })
  @JoinColumn({ name: 'cliente_id' })
  cliente: User;

  @Column({ type: 'uuid', name: 'routine_day_id', nullable: true })
  routine_day_id: string | null;

  @ManyToOne(() => RoutineDay, { nullable: true, eager: false, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'routine_day_id' })
  routine_day: RoutineDay | null;

  @Column({ type: 'timestamptz', name: 'fecha', default: () => 'now()' })
  fecha: Date;

  @Column({ type: 'int', name: 'duracion_min', nullable: true })
  duracion_min: number | null;

  @Column({
    type: 'numeric',
    precision: 10,
    scale: 2,
    name: 'volumen_total',
    nullable: true,
  })
  volumen_total: number | null;

  @Column({ type: 'boolean', name: 'completada', default: false })
  completada: boolean;

  @Column({ type: 'text', name: 'nota_cliente', nullable: true })
  nota_cliente: string | null;

  @OneToMany(() => WorkoutSetLog, (log) => log.session, { cascade: true })
  set_logs: WorkoutSetLog[];
}
