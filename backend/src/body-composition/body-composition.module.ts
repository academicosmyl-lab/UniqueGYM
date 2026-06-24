import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BodyComposition } from './body-composition.entity';
import { BodyCompositionService } from './body-composition.service';
import { BodyCompositionController } from './body-composition.controller';

@Module({
  imports: [TypeOrmModule.forFeature([BodyComposition])],
  providers: [BodyCompositionService],
  controllers: [BodyCompositionController],
  exports: [BodyCompositionService],
})
export class BodyCompositionModule {}
