import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, IsNull, Repository } from 'typeorm';
import { NutritionPlan, ObjetivoNutriPlan } from './entities/nutrition-plan.entity';
import { NutritionMeal } from './entities/nutrition-meal.entity';
import { NutritionMealItem } from './entities/nutrition-meal-item.entity';
import { CreateNutritionPlanDto } from './dto/create-nutrition-plan.dto';
import { AddMealDto } from './dto/add-meal.dto';
import { AddMealItemDto } from './dto/add-meal-item.dto';
import { User } from '../users/entities/user.entity';
import { BodyComposition } from '../body-composition/body-composition.entity';

const MACRO_RATIOS: Record<
  ObjetivoNutriPlan,
  { proteina: number; carbos: number; grasa: number }
> = {
  PERDER_GRASA:  { proteina: 0.40, carbos: 0.30, grasa: 0.30 },
  GANAR_MUSCULO: { proteina: 0.30, carbos: 0.50, grasa: 0.20 },
  MANTENER:      { proteina: 0.30, carbos: 0.45, grasa: 0.25 },
  RECOMPOSICION: { proteina: 0.35, carbos: 0.40, grasa: 0.25 },
};

const KCAL_AJUSTE: Record<ObjetivoNutriPlan, number> = {
  PERDER_GRASA:  -500,
  GANAR_MUSCULO: +300,
  MANTENER:      0,
  RECOMPOSICION: 0,
};

@Injectable()
export class NutritionService {
  constructor(
    @InjectRepository(NutritionPlan)
    private readonly planRepo: Repository<NutritionPlan>,
    @InjectRepository(NutritionMeal)
    private readonly mealRepo: Repository<NutritionMeal>,
    @InjectRepository(NutritionMealItem)
    private readonly itemRepo: Repository<NutritionMealItem>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(BodyComposition)
    private readonly bcRepo: Repository<BodyComposition>,
    private readonly dataSource: DataSource,
  ) {}

  calcularMacros(
    objetivo: ObjetivoNutriPlan,
    kcal: number,
  ): { proteina_g: number; carbos_g: number; grasa_g: number } {
    const r = MACRO_RATIOS[objetivo];
    return {
      proteina_g: Math.round((kcal * r.proteina) / 4),
      carbos_g:   Math.round((kcal * r.carbos)   / 4),
      grasa_g:    Math.round((kcal * r.grasa)     / 9),
    };
  }

  calcularTdee(
    usuario: User,
    peso_kg: number,
  ): number {
    if (
      !usuario.estatura_cm ||
      !usuario.fecha_nac   ||
      !usuario.sexo
    ) {
      throw new BadRequestException(
        'El cliente no tiene estatura, fecha de nacimiento o sexo registrados. ' +
        'Completa el perfil o proporciona kcal_objetivo manualmente.',
      );
    }

    const hoy = new Date();
    const nac = new Date(usuario.fecha_nac);
    let edad = hoy.getFullYear() - nac.getFullYear();
    const mDif = hoy.getMonth() - nac.getMonth();
    if (mDif < 0 || (mDif === 0 && hoy.getDate() < nac.getDate())) {
      edad -= 1;
    }

    const estatura = Number(usuario.estatura_cm);
    const factor   = Number(usuario.factor_actividad) || 1.55;

    let tmb: number;
    if (usuario.sexo === 'M') {
      tmb = 10 * peso_kg + 6.25 * estatura - 5 * edad + 5;
    } else {
      tmb = 10 * peso_kg + 6.25 * estatura - 5 * edad - 161;
    }

    return Math.round(tmb * factor);
  }

  async create(
    dto: CreateNutritionPlanDto,
    creadoPor: string,
  ): Promise<NutritionPlan> {
    const usuario = await this.userRepo.findOne({ where: { id: dto.cliente_id } });
    if (!usuario) {
      throw new NotFoundException(`Cliente ${dto.cliente_id} no encontrado.`);
    }

    let kcal_objetivo: number;
    let proteina_g: number;
    let carbos_g: number;
    let grasa_g: number;
    let agua_ml: number | null = dto.agua_ml ?? null;

    if (
      dto.kcal_objetivo !== undefined &&
      dto.proteina_g    !== undefined &&
      dto.carbos_g      !== undefined &&
      dto.grasa_g       !== undefined
    ) {
      kcal_objetivo = dto.kcal_objetivo;
      proteina_g    = dto.proteina_g;
      carbos_g      = dto.carbos_g;
      grasa_g       = dto.grasa_g;
    } else {
      const ultimaMedicion = await this.bcRepo.findOne({
        where: { cliente_id: dto.cliente_id },
        order: { fecha: 'DESC' },
      });

      if (!ultimaMedicion || ultimaMedicion.peso_kg === null) {
        throw new BadRequestException(
          'No hay medición de peso registrada para el cliente. ' +
          'Registra una medición corporal o proporciona kcal_objetivo, proteina_g, carbos_g y grasa_g manualmente.',
        );
      }

      const peso_kg = Number(ultimaMedicion.peso_kg);
      const tdee    = this.calcularTdee(usuario, peso_kg);

      kcal_objetivo = tdee + KCAL_AJUSTE[dto.objetivo];
      if (kcal_objetivo < 1000) kcal_objetivo = 1000;

      const macros = this.calcularMacros(dto.objetivo, kcal_objetivo);
      proteina_g   = macros.proteina_g;
      carbos_g     = macros.carbos_g;
      grasa_g      = macros.grasa_g;

      if (agua_ml === null) {
        agua_ml = Math.round(peso_kg * 35);
      }
    }

    const plan = this.planRepo.create({
      cliente_id:   dto.cliente_id,
      creada_por:   creadoPor,
      objetivo:     dto.objetivo,
      kcal_objetivo,
      proteina_g,
      carbos_g,
      grasa_g,
      agua_ml,
      notas:        dto.notas ?? null,
      activo:       true,
    });

    return this.planRepo.save(plan);
  }

  async findActivoPorCliente(clienteId: string): Promise<NutritionPlan> {
    const plan = await this.dataSource
      .getRepository(NutritionPlan)
      .createQueryBuilder('plan')
      .where('plan.cliente_id = :clienteId', { clienteId })
      .andWhere('plan.activo = true')
      .andWhere('plan.deleted_at IS NULL')
      .leftJoinAndSelect('plan.comidas', 'comida')
      .leftJoinAndSelect('comida.alimentos', 'alimento')
      .orderBy('plan.created_at', 'DESC')
      .addOrderBy('comida.orden', 'ASC')
      .getOne();

    if (!plan) {
      throw new NotFoundException(
        `No se encontró un plan nutricional activo para el cliente ${clienteId}.`,
      );
    }

    return plan;
  }

  async findAllPorCliente(
    clienteId: string,
  ): Promise<{ data: NutritionPlan[]; total: number }> {
    const data = await this.dataSource
      .getRepository(NutritionPlan)
      .createQueryBuilder('plan')
      .where('plan.cliente_id = :clienteId', { clienteId })
      .andWhere('plan.deleted_at IS NULL')
      .leftJoinAndSelect('plan.comidas', 'comida')
      .leftJoinAndSelect('comida.alimentos', 'alimento')
      .orderBy('plan.created_at', 'DESC')
      .addOrderBy('comida.orden', 'ASC')
      .getMany();

    return { data, total: data.length };
  }

  async addMeal(planId: string, dto: AddMealDto): Promise<NutritionMeal> {
    const plan = await this.planRepo.findOne({
      where: { id: planId, deleted_at: IsNull() },
    });

    if (!plan) {
      throw new NotFoundException(`Plan ${planId} no encontrado.`);
    }

    const meal = this.mealRepo.create({
      plan_id: planId,
      nombre:  dto.nombre,
      orden:   dto.orden ?? 1,
      kcal:    dto.kcal  ?? null,
    });

    return this.mealRepo.save(meal);
  }

  async addMealItem(mealId: string, dto: AddMealItemDto): Promise<NutritionMealItem> {
    const meal = await this.mealRepo.findOne({ where: { id: mealId } });

    if (!meal) {
      throw new NotFoundException(`Comida ${mealId} no encontrada.`);
    }

    const item = this.itemRepo.create({
      meal_id:    mealId,
      alimento:   dto.alimento,
      porcion:    dto.porcion    ?? null,
      kcal:       dto.kcal       ?? null,
      proteina_g: dto.proteina_g ?? null,
      carbos_g:   dto.carbos_g   ?? null,
      grasa_g:    dto.grasa_g    ?? null,
    });

    return this.itemRepo.save(item);
  }

  async desactivar(planId: string): Promise<{ message: string }> {
    const plan = await this.planRepo.findOne({
      where: { id: planId, deleted_at: IsNull() },
    });

    if (!plan) {
      throw new NotFoundException(`Plan ${planId} no encontrado.`);
    }

    plan.activo     = false;
    plan.deleted_at = new Date();
    await this.planRepo.save(plan);

    return { message: `Plan ${planId} desactivado correctamente.` };
  }
}
