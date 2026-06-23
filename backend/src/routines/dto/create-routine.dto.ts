import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { CreateRoutineDayDto } from './create-routine-day.dto';

export class CreateRoutineDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsOptional()
  @IsString()
  objetivo?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(52)
  semanas?: number;

  @IsOptional()
  @IsBoolean()
  es_plantilla?: boolean;

  @IsOptional()
  @IsUUID()
  cliente_id?: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateRoutineDayDto)
  days: CreateRoutineDayDto[];
}
