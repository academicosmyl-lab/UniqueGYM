import {
  IsBoolean,
  IsDateString,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';
import { UserRole } from '../../common/enums/user-role.enum';
import { ObjetivoNutri, SexoBio } from '../entities/user.entity';

export class CreateUserDto {
  @IsUUID()
  @IsNotEmpty()
  gym_id: string;

  @IsUUID()
  @IsOptional()
  sede_id?: string;

  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;

  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  nombres: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  apellidos: string;

  @IsString()
  @IsOptional()
  @MaxLength(40)
  documento?: string;

  @IsEmail()
  @IsOptional()
  @MaxLength(160)
  email?: string;

  @IsString()
  @IsOptional()
  @MaxLength(40)
  telefono?: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsDateString()
  @IsOptional()
  fecha_nac?: string;

  @IsEnum(['M', 'F', 'OTRO'] as SexoBio[])
  @IsOptional()
  sexo?: SexoBio;

  @IsNumber()
  @IsOptional()
  @Min(0)
  estatura_cm?: number;

  @IsEnum(['PERDER_PESO', 'MANTENER', 'GANAR_MASA', 'RENDIMIENTO'] as ObjetivoNutri[])
  @IsOptional()
  objetivo?: ObjetivoNutri;

  @IsNumber()
  @IsOptional()
  @Min(1)
  factor_actividad?: number;

  @IsBoolean()
  @IsOptional()
  acepta_datos?: boolean;
}
