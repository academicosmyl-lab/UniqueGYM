import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';

export class UpdateRoutineDto {
  @IsOptional()
  @IsString()
  nombre?: string;

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
  @IsBoolean()
  activa?: boolean;

  @IsOptional()
  @IsUUID()
  cliente_id?: string;
}
