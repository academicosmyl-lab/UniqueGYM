import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BodyComposition } from './body-composition.entity';
import { CreateBodyCompositionDto } from './dto/create-body-composition.dto';

@Injectable()
export class BodyCompositionService {
  constructor(
    @InjectRepository(BodyComposition)
    private readonly repo: Repository<BodyComposition>,
  ) {}

  async create(dto: CreateBodyCompositionDto): Promise<BodyComposition> {
    const medicion = this.repo.create({
      cliente_id: dto.cliente_id,
      fecha: new Date(dto.fecha),
      fuente: dto.fuente ?? 'PESA',
      peso_kg: dto.peso_kg ?? null,
      grasa_pct: dto.grasa_pct ?? null,
      agua_pct: dto.agua_pct ?? null,
      musculo_kg: dto.musculo_kg ?? null,
      musculo_esqueletico_pct: dto.musculo_esqueletico_pct ?? null,
      hueso_kg: dto.hueso_kg ?? null,
      grasa_visceral: dto.grasa_visceral ?? null,
      grasa_subcutanea_pct: dto.grasa_subcutanea_pct ?? null,
      proteina_pct: dto.proteina_pct ?? null,
      tmb_kcal: dto.tmb_kcal ?? null,
      edad_metabolica: dto.edad_metabolica ?? null,
      imc: dto.imc ?? null,
      masa_libre_grasa_kg: dto.masa_libre_grasa_kg ?? null,
      es_atipica: dto.es_atipica ?? false,
    });

    return this.repo.save(medicion);
  }

  async findByCliente(
    clienteId: string,
    limit = 20,
  ): Promise<{ data: BodyComposition[]; total: number }> {
    const [data, total] = await this.repo.findAndCount({
      where: { cliente_id: clienteId },
      order: { fecha: 'DESC' },
      take: limit,
    });

    return { data, total };
  }

  async findLatest(clienteId: string): Promise<BodyComposition> {
    const medicion = await this.repo.findOne({
      where: { cliente_id: clienteId },
      order: { fecha: 'DESC' },
    });

    if (!medicion) {
      throw new NotFoundException(
        `No se encontraron mediciones para el cliente con id "${clienteId}".`,
      );
    }

    return medicion;
  }
}
