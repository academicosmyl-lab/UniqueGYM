import {
  Body,
  Controller,
  Delete,
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
import { RoutinesService } from './routines.service';
import { CreateRoutineDto } from './dto/create-routine.dto';
import { UpdateRoutineDto } from './dto/update-routine.dto';
import { CreateRoutineDayDto } from './dto/create-routine-day.dto';
import { FindRoutinesDto } from './dto/find-routines.dto';

interface RequestUser {
  sub: string;
  role: UserRole;
  gymId: string;
}

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('routines')
export class RoutinesController {
  constructor(private readonly routinesService: RoutinesService) {}

  // GET /routines/today — debe declararse ANTES de /:id
  @Get('today')
  @Roles(UserRole.CLIENTE)
  async findToday(@CurrentUser() user: RequestUser) {
    const day = await this.routinesService.findToday(user.sub, user.gymId);
    return { data: day };
  }

  // GET /routines
  @Get()
  @Roles(UserRole.ADMIN, UserRole.ENTRENADOR)
  async findAll(
    @CurrentUser() user: RequestUser,
    @Query() filters: FindRoutinesDto,
  ) {
    return this.routinesService.findAll(user.gymId, filters);
  }

  // POST /routines
  @Post()
  @Roles(UserRole.ADMIN, UserRole.ENTRENADOR)
  async create(
    @Body() dto: CreateRoutineDto,
    @CurrentUser() user: RequestUser,
  ) {
    const routine = await this.routinesService.create(dto, user.gymId, user.sub);
    return { data: routine };
  }

  // GET /routines/:id
  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.ENTRENADOR, UserRole.CLIENTE)
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: RequestUser,
  ) {
    const routine = await this.routinesService.findOne(id, user.gymId);
    return { data: routine };
  }

  // PATCH /routines/:id
  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.ENTRENADOR)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateRoutineDto,
    @CurrentUser() user: RequestUser,
  ) {
    const routine = await this.routinesService.update(id, dto, user.gymId);
    return { data: routine };
  }

  // DELETE /routines/:id
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(UserRole.ADMIN, UserRole.ENTRENADOR)
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: RequestUser,
  ) {
    await this.routinesService.remove(id, user.gymId);
  }

  // POST /routines/:id/days
  @Post(':id/days')
  @Roles(UserRole.ADMIN, UserRole.ENTRENADOR)
  async addDay(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateRoutineDayDto,
    @CurrentUser() user: RequestUser,
  ) {
    const day = await this.routinesService.addDay(id, dto, user.gymId);
    return { data: day };
  }

  // DELETE /routines/:routineId/days/:dayId
  @Delete(':routineId/days/:dayId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(UserRole.ADMIN, UserRole.ENTRENADOR)
  async removeDay(
    @Param('routineId', ParseUUIDPipe) routineId: string,
    @Param('dayId', ParseUUIDPipe) dayId: string,
    @CurrentUser() user: RequestUser,
  ) {
    await this.routinesService.removeDay(routineId, dayId, user.gymId);
  }
}
