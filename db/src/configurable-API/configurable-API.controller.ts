import { Body, Controller, Get, Post } from '@nestjs/common';
import { ConfigurableApiService } from './configurable-API.service';
import { EventPattern } from '@nestjs/microservices';

@Controller('configurable-api')
export class ConfigurableApiController {
  constructor(
    private readonly configurableApiService: ConfigurableApiService,
  ) {}
 
  @EventPattern('get_all_configruble-api')
  async getAllAPI() {
    return await this.configurableApiService.getAllApi();
  }

}
