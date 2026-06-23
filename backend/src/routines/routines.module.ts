import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Routine } from './entities/routine.entity';
import { RoutineDay } from './entities/routine-day.entity';
import { RoutineExercise } from './entities/routine-exercise.entity';
import { RoutinesService } from './routines.service';
import { RoutinesController } from './routines.controller';
import { ExercisesModule } from '../exercises/exercises.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Routine, RoutineDay, RoutineExercise]),
    ExercisesModule,
  ],
  providers: [RoutinesService],
  controllers: [RoutinesController],
  exports: [RoutinesService],
})
export class RoutinesModule {}
