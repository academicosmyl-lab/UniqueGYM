import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NutritionPlan } from './entities/nutrition-plan.entity';
import { NutritionMeal } from './entities/nutrition-meal.entity';
import { NutritionMealItem } from './entities/nutrition-meal-item.entity';
import { NutritionService } from './nutrition.service';
import { NutritionController } from './nutrition.controller';
import { User } from '../users/entities/user.entity';
import { BodyComposition } from '../body-composition/body-composition.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      NutritionPlan,
      NutritionMeal,
      NutritionMealItem,
      User,
      BodyComposition,
    ]),
  ],
  providers: [NutritionService],
  controllers: [NutritionController],
  exports: [NutritionService],
})
export class NutritionModule {}
