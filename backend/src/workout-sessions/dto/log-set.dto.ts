import {
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  IsUUID,
  Max,
  Min,
} from 'class-validator';

export class LogSetDto {
  @IsUUID()
  exercise_id: string;

  @IsInt()
  @Min(1)
  numero_serie: number;

  @IsNumber()
  @IsOptional()
  peso?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  reps?: number;

  @IsNumber()
  @Min(1)
  @Max(10)
  @IsOptional()
  rpe?: number;

  @IsBoolean()
  @IsOptional()
  completada?: boolean;
}
