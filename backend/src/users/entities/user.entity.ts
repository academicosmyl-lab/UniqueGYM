import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserRole } from '../../common/enums/user-role.enum';

export type SexoBio = 'M' | 'F' | 'OTRO';
export type ObjetivoNutri =
  | 'PERDER_PESO'
  | 'MANTENER'
  | 'GANAR_MASA'
  | 'RENDIMIENTO';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'gym_id' })
  gym_id: string;

  @Column({ type: 'uuid', name: 'sede_id', nullable: true })
  sede_id: string | null;

  @Column({
    type: 'enum',
    enum: UserRole,
    enumName: 'user_role',
    default: UserRole.CLIENTE,
  })
  role: UserRole;

  @Column({ type: 'varchar', length: 80 })
  nombres: string;

  @Column({ type: 'varchar', length: 80 })
  apellidos: string;

  @Column({ type: 'varchar', length: 40, nullable: true })
  documento: string | null;

  @Column({ type: 'varchar', length: 160, nullable: true, unique: true })
  email: string | null;

  @Column({ type: 'varchar', length: 40, nullable: true })
  telefono: string | null;

  @Column({ type: 'text', name: 'password_hash', nullable: true, select: false })
  password_hash: string | null;

  @Column({ type: 'text', name: 'avatar_url', nullable: true })
  avatar_url: string | null;

  @Column({ type: 'date', name: 'fecha_nac', nullable: true })
  fecha_nac: string | null;

  @Column({
    type: 'enum',
    enum: ['M', 'F', 'OTRO'] as SexoBio[],
    enumName: 'sexo_bio',
    nullable: true,
  })
  sexo: SexoBio | null;

  @Column({
    type: 'numeric',
    precision: 5,
    scale: 1,
    name: 'estatura_cm',
    nullable: true,
  })
  estatura_cm: number | null;

  @Column({
    type: 'enum',
    enum: ['PERDER_PESO', 'MANTENER', 'GANAR_MASA', 'RENDIMIENTO'] as ObjetivoNutri[],
    enumName: 'objetivo_nutri',
    nullable: true,
  })
  objetivo: ObjetivoNutri | null;

  @Column({
    type: 'numeric',
    precision: 4,
    scale: 3,
    name: 'factor_actividad',
    default: 1.55,
  })
  factor_actividad: number;

  @Column({ type: 'boolean', default: true })
  activo: boolean;

  @Column({ type: 'boolean', name: 'acepta_datos', default: false })
  acepta_datos: boolean;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updated_at: Date;

  @DeleteDateColumn({ type: 'timestamptz', name: 'deleted_at', nullable: true })
  deleted_at: Date | null;
}
