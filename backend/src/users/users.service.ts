import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UserRole } from '../common/enums/user-role.enum';

const BCRYPT_ROUNDS = 10;

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
  ) {}

  /**
   * Busca por email incluyendo password_hash (select: false en la columna).
   * Retorna null si no existe o fue eliminado (soft-delete).
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepo
      .createQueryBuilder('u')
      .addSelect('u.password_hash')
      .where('u.email = :email', { email })
      .andWhere('u.deleted_at IS NULL')
      .getOne();
  }

  /**
   * Busca por UUID. Lanza 404 si no existe.
   */
  async findById(id: string): Promise<User> {
    const user = await this.usersRepo.findOne({
      where: { id },
    });
    if (!user) {
      throw new NotFoundException(`Usuario ${id} no encontrado`);
    }
    return user;
  }

  /**
   * Crea un usuario hasheando la contraseña con bcrypt.
   */
  async findByGymAndRole(gymId: string, role?: UserRole): Promise<User[]> {
    const where: any = { gym_id: gymId, activo: true, deleted_at: null };
    if (role) where.role = role;
    return this.usersRepo.find({
      where,
      order: { nombres: 'ASC' },
    });
  }

  async desactivar(id: string): Promise<User> {
    const user = await this.findById(id);
    user.activo = false;
    user.deleted_at = new Date() as any;
    return this.usersRepo.save(user);
  }

  async create(dto: CreateUserDto): Promise<User> {
    const existing = dto.email
      ? await this.usersRepo.findOne({ where: { email: dto.email } })
      : null;

    if (existing) {
      throw new ConflictException('El email ya está registrado');
    }

    const password_hash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);

    const user = this.usersRepo.create({
      gym_id: dto.gym_id,
      sede_id: dto.sede_id ?? null,
      role: dto.role,
      nombres: dto.nombres,
      apellidos: dto.apellidos,
      documento: dto.documento ?? null,
      email: dto.email ?? null,
      telefono: dto.telefono ?? null,
      password_hash,
      fecha_nac: dto.fecha_nac ?? null,
      sexo: dto.sexo ?? null,
      estatura_cm: dto.estatura_cm ?? null,
      objetivo: dto.objetivo ?? null,
      factor_actividad: dto.factor_actividad ?? 1.55,
      acepta_datos: dto.acepta_datos ?? false,
    });

    return this.usersRepo.save(user);
  }
}
