import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole } from '../common/enums/user-role.enum';
import { AnalyticsService } from './analytics.service';

interface RequestUser {
  id: string;
  role: UserRole;
  gymId: string;
}

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('dashboard')
  @Roles(UserRole.ADMIN, UserRole.ENTRENADOR)
  async dashboard(@CurrentUser() user: RequestUser) {
    const data = await this.analyticsService.dashboardAdmin(user.gymId);
    return { data };
  }

  @Get('cliente/:clienteId/composicion')
  @Roles(UserRole.ADMIN, UserRole.ENTRENADOR)
  async composicionCliente(
    @Param('clienteId', ParseUUIDPipe) clienteId: string,
  ) {
    const data = await this.analyticsService.progresoComposicion(clienteId);
    return { data };
  }

  @Get('cliente/:clienteId/entrenamiento')
  @Roles(UserRole.ADMIN, UserRole.ENTRENADOR)
  async entrenamientoCliente(
    @Param('clienteId', ParseUUIDPipe) clienteId: string,
  ) {
    const data = await this.analyticsService.progresoEntrenamiento(clienteId);
    return { data };
  }

  @Get('mi-progreso/composicion')
  @Roles(UserRole.CLIENTE)
  async miComposicion(@CurrentUser() user: RequestUser) {
    const data = await this.analyticsService.progresoComposicion(user.id);
    return { data };
  }

  @Get('mi-progreso/entrenamiento')
  @Roles(UserRole.CLIENTE)
  async miEntrenamiento(@CurrentUser() user: RequestUser) {
    const data = await this.analyticsService.progresoEntrenamiento(user.id);
    return { data };
  }
}
