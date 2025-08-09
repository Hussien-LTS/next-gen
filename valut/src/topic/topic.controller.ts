import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Logger,
  Param,
  Post,
  Req,
  UnauthorizedException,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import { TopicService } from './topic.service';
import { TopicListRequestDto } from './dtos/topic.dto';
import { VaultAuthInterceptor } from 'src/interceptors/vault-auth.interceptor';
import { CustomVaultAuth } from 'src/decorators/vault-auth.decorator';

@ApiTags('Topic')
@Controller('topic')
@ApiSecurity('sessionId')
export class TopicController {
  private readonly logger = new Logger(TopicController.name);
  private currentSession: string | null = null;
  constructor(private readonly topicService: TopicService) {}

  @Post('addupdate_em_catalog__v/:topicIds')
  @UseInterceptors(VaultAuthInterceptor)
  @ApiParam({
    name: 'topicIds',
    required: true,
    description: 'topic ID(s)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiBody({ type: TopicListRequestDto })
  async handleTopicCreatedVV(
    @Req() req: Request,
    @Param('topicIds') topicIdsRaw: string,
    @Body() topicDto: TopicListRequestDto,
    @CustomVaultAuth() vaultData: any,
  ) {
    this.logger.log('🚀 ~ handleTopicCreatedVV ~ topicIds:', topicIdsRaw);
    const topicIds = topicIdsRaw.split(',');

    return await this.topicService.syncTopicCreatedToVV(
      vaultData,
      topicIds,
      topicDto,
    );
  }

  @EventPattern('datasource-topic-handoff')
  @UseInterceptors(VaultAuthInterceptor)
  async handleDatasourceTopicHandoff(
    @Payload() data: any,
    @Ctx() context: RmqContext,
    @CustomVaultAuth() vaultData: any,
  ) {
    this.logger.log(' Handling datasource attachment handoff:', data);
    if (!data || !data.TopicList || !Array.isArray(data.TopicList)) {
      throw new BadRequestException(
        'Invalid data for datasource attachment handoff',
      );
    }
    const topicIds = data.TopicList.map((topic) => topic.TopicID);
    console.log(
      '🚀 ~ TopicController ~ handleDatasourceTopicHandoff ~ topicIds:',
      topicIds,
    );
    try {
      await this.topicService.syncTopicCreatedToVV(vaultData, topicIds, data);
      return { status: 'data received from RMQ and processed', data };
    } catch (error) {
      context.getChannelRef().nack(context.getMessage(), false, false);
      this.logger.error(' Failed to process attachment handoff:', error);
      throw new HttpException(
        'Failed to process attachment handoff',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
