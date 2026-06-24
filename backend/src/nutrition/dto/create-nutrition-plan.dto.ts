import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';
import { ObjetivoNutriPlan } from '../entities/nutrition-plan.entity';

export class CreateNutritionPlanDto {
  @IsUUID()
  cliente_id: string;

  @IsEnum(['PERDER_GRASA', 'GANAR_MUSCULO', 'MANTENER', 'RECOMPOSICION'])
  objetivo: ObjetivoNutriPlan;

  @IsInt()
  @Min(500)
  @Max(10000)
  @IsOptional()
  kcal_objetivo?: number;

  @IsInt()
  @Min(0)
  @Max(1000)
  @IsOptional()
  proteina_g?: number;

  @IsInt()
  @Min(0)
  @Max(2000)
  @IsOptional()
  carbos_g?: number;

  @IsInt()
  @Min(0)
  @Max(1000)
  @IsOptional()
  grasa_g?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  agua_ml?: number;

  @IsString()
  @IsOptional()
  notas?: string;
}
