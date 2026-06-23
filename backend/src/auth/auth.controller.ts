import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthService, LoginResult } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RequestUser } from './strategies/jwt.strategy';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  /**
   * POST /api/v1/auth/login
   * Público. Devuelve JWT + datos básicos del usuario.
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto): Promise<LoginResult> {
    return this.authService.login(dto.email, dto.password);
  }

  /**
   * GET /api/v1/auth/me
   * Protegido con JWT. Devuelve el perfil completo sin password_hash.
   */
  @Get('me')
  @UseGuards(JwtAuthGuard)
  async me(@CurrentUser() requestUser: RequestUser): Promise<Omit<User, 'password_hash'>> {
    const user = await this.usersService.findById(requestUser.id);
    // password_hash ya tiene select: false, no está en el resultado
    return user;
  }
}
