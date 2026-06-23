import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';

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
      synchronize: false, // usar schema.sql / migraciones
    }),
    AuthModule,
    UsersModule,
    // Próximos módulos por fases:
    // ExercisesModule, RoutinesModule, WorkoutSessionsModule,
    // BodyCompositionModule, NutritionModule, AttendanceModule
  ],
})
export class AppModule {}
