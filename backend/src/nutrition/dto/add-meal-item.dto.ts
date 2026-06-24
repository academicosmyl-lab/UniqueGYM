import {
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class AddMealItemDto {
  @IsString()
  @MaxLength(120)
  alimento: string;

  @IsString()
  @MaxLength(80)
  @IsOptional()
  porcion?: string;

  @IsInt()
  @Min(0)
  @Max(5000)
  @IsOptional()
  kcal?: number;

  @IsNumber()
  @Min(0)
  @Max(999.9)
  @IsOptional()
  proteina_g?: number;

  @IsNumber()
  @Min(0)
  @Max(999.9)
  @IsOptional()
  carbos_g?: number;

  @IsNumber()
  @Min(0)
  @Max(999.9)
  @IsOptional()
  grasa_g?: number;
}
