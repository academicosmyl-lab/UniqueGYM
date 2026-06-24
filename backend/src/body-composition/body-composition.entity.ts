import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../users/entities/user.entity';

@Entity('body_composition')
export class BodyComposition {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'cliente_id' })
  cliente_id: string;

  @ManyToOne(() => User, { nullable: false, eager: false })
  @JoinColumn({ name: 'cliente_id' })
  cliente: User;

  @Column({ type: 'timestamptz', name: 'fecha', default: () => 'now()' })
  fecha: Date;

  @Column({ type: 'varchar', length: 20, name: 'fuente', default: 'PESA' })
  fuente: string;

  @Column({ type: 'numeric', precision: 5, scale: 2, name: 'peso_kg', nullable: true })
  peso_kg: number | null;

  @Column({ type: 'numeric', precision: 4, scale: 1, name: 'grasa_pct', nullable: true })
  grasa_pct: number | null;

  @Column({ type: 'numeric', precision: 4, scale: 1, name: 'agua_pct', nullable: true })
  agua_pct: number | null;

  @Column({ type: 'numeric', precision: 5, scale: 2, name: 'musculo_kg', nullable: true })
  musculo_kg: number | null;

  @Column({ type: 'numeric', precision: 4, scale: 1, name: 'musculo_esqueletico_pct', nullable: true })
  musculo_esqueletico_pct: number | null;

  @Column({ type: 'numeric', precision: 4, scale: 2, name: 'hueso_kg', nullable: true })
  hueso_kg: number | null;

  @Column({ type: 'int', name: 'grasa_visceral', nullable: true })
  grasa_visceral: number | null;

  @Column({ type: 'numeric', precision: 4, scale: 1, name: 'grasa_subcutanea_pct', nullable: true })
  grasa_subcutanea_pct: number | null;

  @Column({ type: 'numeric', precision: 4, scale: 1, name: 'proteina_pct', nullable: true })
  proteina_pct: number | null;

  @Column({ type: 'int', name: 'tmb_kcal', nullable: true })
  tmb_kcal: number | null;

  @Column({ type: 'int', name: 'edad_metabolica', nullable: true })
  edad_metabolica: number | null;

  @Column({ type: 'numeric', precision: 4, scale: 1, name: 'imc', nullable: true })
  imc: number | null;

  @Column({ type: 'numeric', precision: 5, scale: 2, name: 'masa_libre_grasa_kg', nullable: true })
  masa_libre_grasa_kg: number | null;

  @Column({ type: 'boolean', name: 'es_atipica', default: false })
  es_atipica: boolean;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  created_at: Date;
}
