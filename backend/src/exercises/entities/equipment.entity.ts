import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('equipment')
export class Equipment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 60 })
  nombre: string;
}
