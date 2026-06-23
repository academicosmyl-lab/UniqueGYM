import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { RoutineDay } from './routine-day.entity';

@Entity('routines')
export class Routine {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'gym_id' })
  gym_id: string;

  @Column({ type: 'uuid', name: 'cliente_id', nullable: true })
  cliente_id: string | null;

  @ManyToOne(() => User, { nullable: true, eager: false })
  @JoinColumn({ name: 'cliente_id' })
  cliente: User | null;

  @Column({ type: 'uuid', name: 'creada_por' })
  creada_por: string;

  @ManyToOne(() => User, { nullable: false, eager: false })
  @JoinColumn({ name: 'creada_por' })
  creador: User;

  @Column({ type: 'varchar', length: 120 })
  nombre: string;

  @Column({ type: 'varchar', length: 60, nullable: true })
  objetivo: string | null;

  @Column({ type: 'int', default: 4 })
  semanas: number;

  @Column({ type: 'boolean', name: 'es_plantilla', default: false })
  es_plantilla: boolean;

  @Column({ type: 'boolean', default: true })
  activa: boolean;

  @OneToMany(() => RoutineDay, (day) => day.routine, { cascade: true })
  days: RoutineDay[];

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  created_at: Date;

  @DeleteDateColumn({ type: 'timestamptz', name: 'deleted_at', nullable: true })
  deleted_at: Date | null;
}
