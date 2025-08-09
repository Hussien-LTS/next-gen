import {
  Body,
  Controller,
  Headers,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { SparkService } from './spark.service';
import { SparkMessageDto } from './dtos/sparkMessage.dto';
import { ApiBody, ApiHeader, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/libs/shared-auth/jwt-auth.guard';

@ApiTags('Spark')
@UseGuards(JwtAuthGuard)
@Controller('spark')
export class SparkController {
  constructor(private readonly sparkService: SparkService) {}
  @Post('message')
  @ApiBody({ type: SparkMessageDto })
  @ApiHeader({
    name: 'auth',
    description: 'Token JWT',
    required: true,
  })
  handleSparkMessage(
    @Headers('auth') authToken: string,
    @Body() payload: SparkMessageDto,
  ) {
    const sparkMessage = payload?.message;
    return this.sparkService.handleSparkMessage(sparkMessage, authToken);
  }
}
