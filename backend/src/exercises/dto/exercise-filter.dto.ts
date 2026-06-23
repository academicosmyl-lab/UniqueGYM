import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';

export class ExerciseFilterDto {
  @IsOptional()
  @IsUUID()
  muscle_id?: string;

  @IsOptional()
  @IsEnum(['PRINCIPIANTE', 'INTERMEDIO', 'AVANZADO'])
  dificultad?: string;

  @IsOptional()
  @IsUUID()
  equipment_id?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}
