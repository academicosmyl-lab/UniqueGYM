import { IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export class AddMealDto {
  @IsString()
  @MaxLength(60)
  nombre: string;

  @IsInt()
  @Min(1)
  @Max(20)
  @IsOptional()
  orden?: number;

  @IsInt()
  @Min(0)
  @Max(5000)
  @IsOptional()
  kcal?: number;
}
