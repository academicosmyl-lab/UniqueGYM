import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ExercisesModule } from './exercises/exercises.module';
import { RoutinesModule } from './routines/routines.module';
import { WorkoutSessionsModule } from './workout-sessions/workout-sessions.module';
import { BodyCompositionModule } from './body-composition/body-composition.module';
import { NutritionModule } from './nutrition/nutrition.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { AttendanceModule } from './attendance/attendance.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '5432', 10),
      username: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      autoLoadEntities: true,
      synchronize: false,
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
    }),
    AuthModule,
    UsersModule,
    ExercisesModule,
    RoutinesModule,
    WorkoutSessionsModule,
    BodyCompositionModule,
    NutritionModule,
    AnalyticsModule,
    AttendanceModule,
  ],
})
export class AppModule {}
