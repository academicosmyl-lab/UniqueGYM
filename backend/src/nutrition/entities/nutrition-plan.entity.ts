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
import { NutritionMeal } from './nutrition-meal.entity';

export type ObjetivoNutriPlan =
  | 'PERDER_GRASA'
  | 'GANAR_MUSCULO'
  | 'MANTENER'
  | 'RECOMPOSICION';

@Entity('nutrition_plans')
export class NutritionPlan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'cliente_id' })
  cliente_id: string;

  @ManyToOne(() => User, { nullable: false, eager: false })
  @JoinColumn({ name: 'cliente_id' })
  cliente: User;

  @Column({ type: 'uuid', name: 'creada_por' })
  creada_por: string;

  @ManyToOne(() => User, { nullable: false, eager: false })
  @JoinColumn({ name: 'creada_por' })
  creador: User;

  @Column({
    type: 'enum',
    enum: ['PERDER_GRASA', 'GANAR_MUSCULO', 'MANTENER', 'RECOMPOSICION'] as ObjetivoNutriPlan[],
    enumName: 'objetivo_nutri_plan',
  })
  objetivo: ObjetivoNutriPlan;

  @Column({ type: 'int', name: 'kcal_objetivo' })
  kcal_objetivo: number;

  @Column({ type: 'int', name: 'proteina_g' })
  proteina_g: number;

  @Column({ type: 'int', name: 'carbos_g' })
  carbos_g: number;

  @Column({ type: 'int', name: 'grasa_g' })
  grasa_g: number;

  @Column({ type: 'int', name: 'agua_ml', nullable: true })
  agua_ml: number | null;

  @Column({ type: 'text', nullable: true })
  notas: string | null;

  @Column({ type: 'boolean', default: true })
  activo: boolean;

  @OneToMany(() => NutritionMeal, (meal) => meal.plan, { cascade: true })
  comidas: NutritionMeal[];

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  created_at: Date;

  @DeleteDateColumn({ type: 'timestamptz', name: 'deleted_at', nullable: true })
  deleted_at: Date | null;
}
