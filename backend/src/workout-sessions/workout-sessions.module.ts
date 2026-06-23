import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkoutSession } from './entities/workout-session.entity';
import { WorkoutSetLog } from './entities/workout-set-log.entity';
import { WorkoutSessionsService } from './workout-sessions.service';
import { WorkoutSessionsController } from './workout-sessions.controller';
import { RoutinesModule } from '../routines/routines.module';
import { RoutineDay } from '../routines/entities/routine-day.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([WorkoutSession, WorkoutSetLog, RoutineDay]),
    RoutinesModule,
  ],
  providers: [WorkoutSessionsService],
  controllers: [WorkoutSessionsController],
  exports: [WorkoutSessionsService],
})
export class WorkoutSessionsModule {}
