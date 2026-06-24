import {
  IsBoolean,
  IsDateString,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsUUID,
  Max,
  Min,
} from 'class-validator';

export class CreateBodyCompositionDto {
  @IsUUID()
  cliente_id: string;

  @IsDateString()
  fecha: string;

  @IsIn(['PESA', 'MANUAL'])
  @IsOptional()
  fuente?: string;

  @IsNumber()
  @Min(0)
  @Max(999.99)
  @IsOptional()
  peso_kg?: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  grasa_pct?: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  agua_pct?: number;

  @IsNumber()
  @Min(0)
  @Max(999.99)
  @IsOptional()
  musculo_kg?: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  musculo_esqueletico_pct?: number;

  @IsNumber()
  @Min(0)
  @Max(99.99)
  @IsOptional()
  hueso_kg?: number;

  @IsInt()
  @Min(0)
  @Max(30)
  @IsOptional()
  grasa_visceral?: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  grasa_subcutanea_pct?: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  proteina_pct?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  tmb_kcal?: number;

  @IsInt()
  @Min(0)
  @Max(120)
  @IsOptional()
  edad_metabolica?: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  imc?: number;

  @IsNumber()
  @Min(0)
  @Max(999.99)
  @IsOptional()
  masa_libre_grasa_kg?: number;

  @IsBoolean()
  @IsOptional()
  es_atipica?: boolean;
}
