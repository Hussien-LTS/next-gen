// src/spark/spark.controller.ts
import { Controller, Post, Req, Res, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { SparkService } from './services/spark.service';
 

export class SparkMessageDto {
 
  event_type: string;

 
  object: string;

 
  record_id: string;

 
  timestamp: string;
 
  user: string;
 
  data: Record<string, any>;
}

@Controller('spark')
export class SparkController {
  constructor(private readonly sparkService: SparkService) {}

  @Post('message')
  async receiveMessage(@Req() req: Request, @Res() res: Response) {
       
  }
}
