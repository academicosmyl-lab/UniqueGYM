import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole } from '../common/enums/user-role.enum';
import { NutritionService } from './nutrition.service';
import { CreateNutritionPlanDto } from './dto/create-nutrition-plan.dto';
import { AddMealDto } from './dto/add-meal.dto';
import { AddMealItemDto } from './dto/add-meal-item.dto';

interface RequestUser {
  id: string;
  role: UserRole;
  gymId: string;
}

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('nutrition')
export class NutritionController {
  constructor(private readonly nutritionService: NutritionService) {}

  @Post('planes')
  @Roles(UserRole.ADMIN, UserRole.ENTRENADOR)
  @HttpCode(HttpStatus.CREATED)
  async create(
    @CurrentUser() user: RequestUser,
    @Body() dto: CreateNutritionPlanDto,
  ) {
    const plan = await this.nutritionService.create(dto, user.id);
    return { data: plan };
  }

  @Get('planes/cliente/:clienteId')
  @Roles(UserRole.ADMIN, UserRole.ENTRENADOR)
  async findAllPorCliente(
    @Param('clienteId', ParseUUIDPipe) clienteId: string,
  ) {
    return this.nutritionService.findAllPorCliente(clienteId);
  }

  @Get('mi-plan')
  @Roles(UserRole.CLIENTE)
  async findMiPlan(@CurrentUser() user: RequestUser) {
    const plan = await this.nutritionService.findActivoPorCliente(user.id);
    return { data: plan };
  }

  @Post('planes/:planId/comidas')
  @Roles(UserRole.ADMIN, UserRole.ENTRENADOR)
  @HttpCode(HttpStatus.CREATED)
  async addMeal(
    @Param('planId', ParseUUIDPipe) planId: string,
    @Body() dto: AddMealDto,
  ) {
    const meal = await this.nutritionService.addMeal(planId, dto);
    return { data: meal };
  }

  @Post('comidas/:mealId/alimentos')
  @Roles(UserRole.ADMIN, UserRole.ENTRENADOR)
  @HttpCode(HttpStatus.CREATED)
  async addMealItem(
    @Param('mealId', ParseUUIDPipe) mealId: string,
    @Body() dto: AddMealItemDto,
  ) {
    const item = await this.nutritionService.addMealItem(mealId, dto);
    return { data: item };
  }

  @Delete('planes/:planId')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  async desactivar(@Param('planId', ParseUUIDPipe) planId: string) {
    return this.nutritionService.desactivar(planId);
  }
}
