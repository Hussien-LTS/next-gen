import { Module } from '@nestjs/common';
import { SparkController } from './spark.controller';
import { SparkService } from './spark.service';
import { JwtSharedModule } from 'src/shared/jwt-shared.module';

@Module({
  imports: [JwtSharedModule],
  controllers: [SparkController],
  providers: [SparkService],
})
export class SparkModule {}
