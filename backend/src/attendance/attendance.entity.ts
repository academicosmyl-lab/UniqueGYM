import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../users/entities/user.entity';

@Entity('attendance')
export class Attendance {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'cliente_id' })
  cliente_id: string;

  @ManyToOne(() => User, { nullable: false, eager: false })
  @JoinColumn({ name: 'cliente_id' })
  cliente: User;

  @Column({ type: 'uuid', name: 'sede_id', nullable: true })
  sede_id: string | null;

  @CreateDateColumn({ type: 'timestamptz', name: 'check_in' })
  check_in: Date;

  @Column({ type: 'varchar', length: 20, name: 'metodo', default: 'MANUAL' })
  metodo: string;
}
