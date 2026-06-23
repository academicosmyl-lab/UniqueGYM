import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export class CreateRoutineExerciseDto {
  @IsUUID()
  @IsNotEmpty()
  exercise_id: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  orden?: number;

  @IsInt()
  @Min(1)
  series: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  reps_min?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  reps_max?: number;

  @IsOptional()
  @IsNumber()
  peso_sugerido?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  descanso_seg?: number;

  @IsOptional()
  @IsString()
  notas?: string;
}
