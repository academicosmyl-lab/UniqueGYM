import { IsOptional, IsString } from 'class-validator';

export class CompleteSessionDto {
  @IsString()
  @IsOptional()
  nota_cliente?: string;
}
