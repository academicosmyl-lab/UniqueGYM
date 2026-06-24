import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { MuscleInputDto } from './muscle-input.dto';

export type Difficulty = 'PRINCIPIANTE' | 'INTERMEDIO' | 'AVANZADO';

export class CreateExerciseDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsString()
  instrucciones?: string;

  @IsOptional()
  @IsUrl()
  video_url?: string;

  @IsOptional()
  @IsString()
  thumbnail_url?: string;

  @IsOptional()
  @IsUrl()
  gif_url?: string;

  @IsOptional()
  @IsUUID()
  equipment_id?: string;

  @IsOptional()
  @IsEnum(['PRINCIPIANTE', 'INTERMEDIO', 'AVANZADO'])
  dificultad?: Difficulty;

  @IsOptional()
  @IsBoolean()
  es_publico?: boolean;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MuscleInputDto)
  muscle_ids: MuscleInputDto[];
}
