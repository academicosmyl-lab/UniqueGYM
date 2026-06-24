import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole } from '../common/enums/user-role.enum';
import { AttendanceService } from './attendance.service';
import { CreateAttendanceDto } from './dto/create-attendance.dto';

interface RequestUser {
  id: string;
  role: UserRole;
  gymId: string;
}

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.ENTRENADOR, UserRole.RECEPCION)
  @HttpCode(HttpStatus.CREATED)
  async registrar(@Body() dto: CreateAttendanceDto) {
    return this.attendanceService.registrar(dto);
  }

  @Post('mi-entrada')
  @Roles(UserRole.CLIENTE)
  @HttpCode(HttpStatus.CREATED)
  async miEntrada(@CurrentUser() user: RequestUser) {
    return this.attendanceService.registrar({
      cliente_id: user.id,
      metodo: 'APP',
    });
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.ENTRENADOR, UserRole.RECEPCION)
  async findByGym(
    @CurrentUser() user: RequestUser,
    @Query('desde') desde?: string,
    @Query('hasta') hasta?: string,
  ) {
    return this.attendanceService.findByGym(user.gymId, desde, hasta);
  }

  @Get('mis-entradas')
  @Roles(UserRole.CLIENTE)
  async misEntradas(@CurrentUser() user: RequestUser) {
    return this.attendanceService.findByCliente(user.id);
  }
}
