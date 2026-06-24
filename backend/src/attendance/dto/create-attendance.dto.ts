import { IsIn, IsOptional, IsUUID } from 'class-validator';

export class CreateAttendanceDto {
  @IsUUID()
  cliente_id: string;

  @IsOptional()
  @IsIn(['QR', 'MANUAL', 'APP'])
  metodo?: string;
}
