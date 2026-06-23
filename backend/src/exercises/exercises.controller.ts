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
import { RequestUser } from '../auth/strategies/jwt.strategy';
import { ExercisesService } from './exercises.service';
import { CreateExerciseDto } from './dto/create-exercise.dto';
import { UpdateExerciseDto } from './dto/update-exercise.dto';
import { ExerciseFilterDto } from './dto/exercise-filter.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('exercises')
export class ExercisesController {
  constructor(private readonly exercisesService: ExercisesService) {}

  @Get()
  findAll(
    @CurrentUser() user: RequestUser,
    @Query() filters: ExerciseFilterDto,
  ) {
    return this.exercisesService.findAll(user.gymId, filters);
  }

  @Get('muscles')
  findMuscleGroups() {
    return this.exercisesService.findMuscleGroups();
  }

  @Get('equipment')
  findEquipment() {
    return this.exercisesService.findEquipment();
  }

  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: RequestUser,
  ) {
    return this.exercisesService.findOne(id, user.gymId);
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.ENTRENADOR)
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body() dto: CreateExerciseDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.exercisesService.create(dto, user.gymId, user.id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.ENTRENADOR)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateExerciseDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.exercisesService.update(id, dto, user.gymId);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.ENTRENADOR)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: RequestUser,
  ) {
    return this.exercisesService.remove(id, user.gymId);
  }
}
