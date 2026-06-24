import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BodyComposition } from '../body-composition/body-composition.entity';
import { WorkoutSession } from '../workout-sessions/entities/workout-session.entity';
import { WorkoutSetLog } from '../workout-sessions/entities/workout-set-log.entity';
import { User } from '../users/entities/user.entity';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      BodyComposition,
      WorkoutSession,
      WorkoutSetLog,
      User,
    ]),
  ],
  providers: [AnalyticsService],
  controllers: [AnalyticsController],
})
export class AnalyticsModule {}
