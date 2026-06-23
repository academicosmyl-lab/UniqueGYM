import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('muscle_groups')
export class MuscleGroup {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 60 })
  nombre: string;
}
