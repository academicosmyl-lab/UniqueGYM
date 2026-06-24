import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { NutritionPlan } from './nutrition-plan.entity';
import { NutritionMealItem } from './nutrition-meal-item.entity';

@Entity('nutrition_meals')
export class NutritionMeal {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'plan_id' })
  plan_id: string;

  @ManyToOne(() => NutritionPlan, (plan) => plan.comidas, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'plan_id' })
  plan: NutritionPlan;

  @Column({ type: 'varchar', length: 60 })
  nombre: string;

  @Column({ type: 'int', default: 1 })
  orden: number;

  @Column({ type: 'int', nullable: true })
  kcal: number | null;

  @OneToMany(() => NutritionMealItem, (item) => item.meal, { cascade: true })
  alimentos: NutritionMealItem[];
}
