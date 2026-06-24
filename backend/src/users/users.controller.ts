import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
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
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';

interface RequestUser {
  id: string;
  role: UserRole;
  gymId: string;
}

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.ENTRENADOR)
  async findAll(
    @CurrentUser() user: RequestUser,
    @Query('role') role?: UserRole,
  ) {
    return this.usersService.findByGymAndRole(user.gymId, role);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.ENTRENADOR)
  async findOne(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @Post()
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  async create(
    @CurrentUser() user: RequestUser,
    @Body() dto: CreateUserDto,
  ) {
    dto.gym_id = user.gymId;
    return this.usersService.create(dto);
  }

  @Patch(':id/desactivar')
  @Roles(UserRole.ADMIN)
  async desactivar(@Param('id') id: string) {
    return this.usersService.desactivar(id);
  }
}
