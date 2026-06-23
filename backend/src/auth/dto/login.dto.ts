import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'Debe ser un email válido' })
  @IsNotEmpty()
  @MaxLength(160)
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
