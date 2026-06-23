import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole } from '../common/enums/user-role.enum';
import { WorkoutSessionsService } from './workout-sessions.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { LogSetDto } from './dto/log-set.dto';
import { CompleteSessionDto } from './dto/complete-session.dto';
import { SessionFilterDto } from './dto/session-filter.dto';

interface RequestUser {
  id: string;
  role: UserRole;
  gymId: string;
}

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('workout-sessions')
export class WorkoutSessionsController {
  constructor(
    private readonly workoutSessionsService: WorkoutSessionsService,
  ) {}

  // POST /workout-sessions
  @Post()
  @Roles(UserRole.CLIENTE)
  @HttpCode(HttpStatus.CREATED)
  async startSession(
    @CurrentUser() user: RequestUser,
    @Body() dto: CreateSessionDto,
  ) {
    const session = await this.workoutSessionsService.startSession(
      user.id,
      dto,
    );
    return { data: session };
  }

  // GET /workout-sessions
  @Get()
  @Roles(UserRole.CLIENTE)
  async findHistory(
    @CurrentUser() user: RequestUser,
    @Query() filters: SessionFilterDto,
  ) {
    return this.workoutSessionsService.findHistory(user.id, filters);
  }

  // GET /workout-sessions/:id
  @Get(':id')
  @Roles(UserRole.CLIENTE)
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: RequestUser,
  ) {
    const session = await this.workoutSessionsService.findOne(id, user.id);
    return { data: session };
  }

  // POST /workout-sessions/:id/sets
  @Post(':id/sets')
  @Roles(UserRole.CLIENTE)
  @HttpCode(HttpStatus.CREATED)
  async logSet(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: RequestUser,
    @Body() dto: LogSetDto,
  ) {
    const setLog = await this.workoutSessionsService.logSet(id, user.id, dto);
    return { data: setLog };
  }

  // PATCH /workout-sessions/:id/complete
  @Patch(':id/complete')
  @Roles(UserRole.CLIENTE)
  async completeSession(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: RequestUser,
    @Body() dto: CompleteSessionDto,
  ) {
    const session = await this.workoutSessionsService.completeSession(
      id,
      user.id,
      dto,
    );
    return { data: session };
  }
}
