import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Exercise } from './entities/exercise.entity';
import { ExerciseMuscle } from './entities/exercise-muscle.entity';
import { MuscleGroup } from './entities/muscle-group.entity';
import { Equipment } from './entities/equipment.entity';
import { ExercisesService } from './exercises.service';
import { ExercisesController } from './exercises.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Exercise, ExerciseMuscle, MuscleGroup, Equipment]),
  ],
  providers: [ExercisesService],
  controllers: [ExercisesController],
  exports: [ExercisesService],
})
export class ExercisesModule {}
