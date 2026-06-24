import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { NutritionMeal } from './nutrition-meal.entity';

@Entity('nutrition_meal_items')
export class NutritionMealItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'meal_id' })
  meal_id: string;

  @ManyToOne(() => NutritionMeal, (meal) => meal.alimentos, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'meal_id' })
  meal: NutritionMeal;

  @Column({ type: 'varchar', length: 120 })
  alimento: string;

  @Column({ type: 'varchar', length: 80, nullable: true })
  porcion: string | null;

  @Column({ type: 'int', nullable: true })
  kcal: number | null;

  @Column({ type: 'numeric', precision: 5, scale: 1, name: 'proteina_g', nullable: true })
  proteina_g: number | null;

  @Column({ type: 'numeric', precision: 5, scale: 1, name: 'carbos_g', nullable: true })
  carbos_g: number | null;

  @Column({ type: 'numeric', precision: 5, scale: 1, name: 'grasa_g', nullable: true })
  grasa_g: number | null;
}
