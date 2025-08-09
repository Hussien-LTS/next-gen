import { Body, Controller, Get, Headers, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { AddUpdateTopicInfoModel } from './models/add_update_topic_info.model';
import { ApiBody, ApiHeader, ApiOperation, ApiTags } from '@nestjs/swagger';
@ApiTags('Centris')
@Controller('Centris')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('Centris-test')
  @ApiOperation({ summary: 'Fetch Vault documents events' })
  @Post('AddUpdateTopicInformation')
  @ApiBody({
    type: AddUpdateTopicInfoModel,
  })
  toCintris(
    @Body() addUpdateTopiv: AddUpdateTopicInfoModel,
  ): AddUpdateTopicInfoModel {
    return addUpdateTopiv;
  }

  @Post('auth-validate')
  @ApiOperation({ summary: 'Validate JWT from custom header (auth-citris)' })
  @ApiHeader({
    name: 'auth-citris',
    description: 'JWT token used for validation',
    required: true,
  })
  async validateTokenFromCustomHeader(@Headers('auth-citris') token: string) {
    return this.appService.validateTokenWithAuthApp(token);
  }
}
