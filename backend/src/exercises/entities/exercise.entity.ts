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
import { Equipment } from './equipment.entity';
import { User } from '../../users/entities/user.entity';
import { ExerciseMuscle } from './exercise-muscle.entity';

export type Difficulty = 'PRINCIPIANTE' | 'INTERMEDIO' | 'AVANZADO';

@Entity('exercises')
export class Exercise {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'gym_id' })
  gym_id: string;

  @Column({ type: 'varchar', length: 120 })
  nombre: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string | null;

  @Column({ type: 'text', nullable: true })
  instrucciones: string | null;

  @Column({ type: 'text', name: 'video_url', nullable: true })
  video_url: string | null;

  @Column({ type: 'text', name: 'thumbnail_url', nullable: true })
  thumbnail_url: string | null;

  @Column({ type: 'text', name: 'gif_url', nullable: true })
  gif_url: string | null;

  @Column({ type: 'uuid', name: 'equipment_id', nullable: true })
  equipment_id: string | null;

  @ManyToOne(() => Equipment, { nullable: true, eager: false })
  @JoinColumn({ name: 'equipment_id' })
  equipment: Equipment | null;

  @Column({
    type: 'enum',
    enum: ['PRINCIPIANTE', 'INTERMEDIO', 'AVANZADO'] as Difficulty[],
    enumName: 'difficulty',
    default: 'INTERMEDIO',
  })
  dificultad: Difficulty;

  @Column({ type: 'boolean', name: 'es_publico', default: true })
  es_publico: boolean;

  @Column({ type: 'uuid', name: 'created_by', nullable: true })
  created_by: string | null;

  @ManyToOne(() => User, { nullable: true, eager: false })
  @JoinColumn({ name: 'created_by' })
  creator: User | null;

  @OneToMany(() => ExerciseMuscle, (em) => em.exercise, { cascade: true })
  exercise_muscles: ExerciseMuscle[];

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  created_at: Date;

  @DeleteDateColumn({ type: 'timestamptz', name: 'deleted_at', nullable: true })
  deleted_at: Date | null;
}
