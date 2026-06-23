import { IsBoolean, IsUUID } from 'class-validator';

export class MuscleInputDto {
  @IsUUID()
  muscle_id: string;

  @IsBoolean()
  es_primario: boolean;
}
