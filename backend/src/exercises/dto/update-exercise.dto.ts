import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { MuscleInputDto } from './muscle-input.dto';

export class UpdateExerciseDto {
  @IsOptional()
  @IsString()
  nombre?: string;

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
  @IsUUID()
  equipment_id?: string;

  @IsOptional()
  @IsEnum(['PRINCIPIANTE', 'INTERMEDIO', 'AVANZADO'])
  dificultad?: 'PRINCIPIANTE' | 'INTERMEDIO' | 'AVANZADO';

  @IsOptional()
  @IsBoolean()
  es_publico?: boolean;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MuscleInputDto)
  muscle_ids?: MuscleInputDto[];
}
