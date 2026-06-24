import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole } from '../common/enums/user-role.enum';
import { BodyCompositionService } from './body-composition.service';
import { CreateBodyCompositionDto } from './dto/create-body-composition.dto';

interface RequestUser {
  id: string;
  role: UserRole;
  gymId: string;
}

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('body-composition')
export class BodyCompositionController {
  constructor(
    private readonly bodyCompositionService: BodyCompositionService,
  ) {}

  // POST /body-composition — registra medición para un cliente (staff)
  @Post()
  @Roles(UserRole.ADMIN, UserRole.ENTRENADOR)
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateBodyCompositionDto) {
    const medicion = await this.bodyCompositionService.create(dto);
    return { data: medicion };
  }

  // POST /body-composition/mi-medicion — el cliente registra la propia
  @Post('mi-medicion')
  @Roles(UserRole.CLIENTE)
  @HttpCode(HttpStatus.CREATED)
  async createPropia(
    @CurrentUser() user: RequestUser,
    @Body() dto: CreateBodyCompositionDto,
  ) {
    dto.cliente_id = user.id;
    const medicion = await this.bodyCompositionService.create(dto);
    return { data: medicion };
  }

  // GET /body-composition/mis-mediciones — el cliente ve las propias
  @Get('mis-mediciones')
  @Roles(UserRole.CLIENTE)
  async findPropias(
    @CurrentUser() user: RequestUser,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    return this.bodyCompositionService.findByCliente(user.id, limit ?? 20);
  }

  // GET /body-composition/cliente/:clienteId — staff ve historial de un cliente
  @Get('cliente/:clienteId')
  @Roles(UserRole.ADMIN, UserRole.ENTRENADOR)
  async findByCliente(
    @Param('clienteId', ParseUUIDPipe) clienteId: string,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    return this.bodyCompositionService.findByCliente(clienteId, limit ?? 20);
  }

  // GET /body-composition/cliente/:clienteId/ultima — staff ve última medición
  @Get('cliente/:clienteId/ultima')
  @Roles(UserRole.ADMIN, UserRole.ENTRENADOR)
  async findLatestByCliente(
    @Param('clienteId', ParseUUIDPipe) clienteId: string,
  ) {
    const medicion = await this.bodyCompositionService.findLatest(clienteId);
    return { data: medicion };
  }

  // GET /body-composition/mi-ultima — el cliente ve su última medición
  @Get('mi-ultima')
  @Roles(UserRole.CLIENTE)
  async findLatestPropia(@CurrentUser() user: RequestUser) {
    const medicion = await this.bodyCompositionService.findLatest(user.id);
    return { data: medicion };
  }
}
