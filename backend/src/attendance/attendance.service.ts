import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { Attendance } from './attendance.entity';
import { CreateAttendanceDto } from './dto/create-attendance.dto';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(Attendance)
    private readonly repo: Repository<Attendance>,
  ) {}

  async registrar(dto: CreateAttendanceDto): Promise<Attendance> {
    const entry = this.repo.create({
      cliente_id: dto.cliente_id,
      metodo: dto.metodo ?? 'MANUAL',
    });
    return this.repo.save(entry);
  }

  async findByGym(
    gymId: string,
    desde?: string,
    hasta?: string,
  ): Promise<Attendance[]> {
    const desdeDate = desde ? new Date(desde) : new Date(new Date().setHours(0, 0, 0, 0));
    const hastaDate = hasta ? new Date(hasta) : new Date(new Date().setHours(23, 59, 59, 999));

    return this.repo
      .createQueryBuilder('a')
      .innerJoinAndSelect('a.cliente', 'u')
      .where('u.gym_id = :gymId', { gymId })
      .andWhere('a.check_in BETWEEN :desde AND :hasta', {
        desde: desdeDate,
        hasta: hastaDate,
      })
      .orderBy('a.check_in', 'DESC')
      .getMany();
  }

  async findByCliente(clienteId: string, limit = 20): Promise<Attendance[]> {
    return this.repo.find({
      where: { cliente_id: clienteId },
      order: { check_in: 'DESC' },
      take: limit,
    });
  }
}
