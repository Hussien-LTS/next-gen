import {
  Body,
  Controller,
  Get,
  Headers,
  HttpException,
  HttpStatus,
  Param,
  Put,
} from '@nestjs/common';
import { SpeakersService } from './speakers.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiHeader,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('speakers')
@Controller('speakers')
export class SpeakersController {
  constructor(private readonly speakersService: SpeakersService) {}

  @Get('event_speaker')
  @ApiBearerAuth('vault-auth')
  @ApiOperation({ summary: 'List All speakers events from Veeva Vault' })
  @ApiHeader({
    name: 'auth',
    description: 'Vault Session ID (use /auth endpoint to get it)',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'List All speakers events from Veeva Vault',
  })
  @ApiResponse({ status: 400, description: 'Missing or invalid token' })
  async listAllEventsSpeakers(
    @Headers() headers: Record<string, string>,
  ): Promise<any> {
    const authToken = headers['auth'];
    return await this.speakersService.listAllEventsSpeakers(authToken);
  }

  @Get('event_speaker/:id')
  @ApiBearerAuth('vault-auth')
  @ApiOperation({ summary: 'retreieve speaker event by id from Veeva Vault' })
  @ApiHeader({
    name: 'auth',
    description: 'Vault Session ID (use /auth endpoint to get it)',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'retreieve speaker event by id from Veeva Vault',
  })
  @ApiResponse({ status: 400, description: 'Missing or invalid token' })
  async listAllEventSpeakerById(
    @Headers() headers: Record<string, string>,
    @Param('id') id: string,
  ) {
    const authToken = headers['auth'];
    return await this.speakersService.listEventSpeakerById(authToken, id);
  }

  @Get()
  @ApiBearerAuth('vault-auth')
  @ApiOperation({ summary: 'List All speakers   from Veeva Vault' })
  @ApiHeader({
    name: 'auth',
    description: 'Vault Session ID (use /auth endpoint to get it)',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'List All speakers from Veeva Vault',
  })
  @ApiResponse({ status: 400, description: 'Missing or invalid token' })
  async listAllSpeakers(@Headers() headers: Record<string, string>) {
    const authToken = headers['auth'];
    return await this.speakersService.listAllSpeakers(authToken);
  }

  @Get(':id')
  @ApiBearerAuth('vault-auth')
  @ApiOperation({ summary: 'retreieve speaker   by id from Veeva Vault' })
  @ApiHeader({
    name: 'auth',
    description: 'Vault Session ID (use /auth endpoint to get it)',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'retreieve speaker   by id from Veeva Vault',
  })
  @ApiResponse({ status: 400, description: 'Missing or invalid token' })
  async listAllSpeakerById(
    @Headers() headers: Record<string, string>,
    @Param('id') id: string,
  ) {
    const authToken = headers['auth'];
    return await this.speakersService.listAllSpeakerById(authToken, id);
  }

  @Put(':speakerId')
  @ApiConsumes('application/x-www-form-urlencoded')
  @ApiParam({ name: 'speakerId', description: 'ID of the speaker to update' })
  @ApiBearerAuth('vault-auth')
  @ApiOperation({ summary: 'Update speaker by id in Veeva Vault' })
  @ApiHeader({
    name: 'auth',
    description: 'Vault Session ID (use /auth endpoint to get it)',
    required: true,
  })
  @ApiBody({
    type: Object,
    description: 'speaker Object',
    required: true,
  })
  @ApiResponse({ status: 200, description: 'speaker updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async updateSpeaker(
    @Headers() headers: Record<string, string>,
    @Param('speakerId') speakerId: string,
    @Body() body: any,
  ) {
    const authToken = headers['auth'];
    if (!authToken) {
      throw new HttpException(
        'Missing Authorization header',
        HttpStatus.BAD_REQUEST,
      );
    }
    return await this.speakersService.updateSpeaker(authToken, speakerId, body);
  }

  @Get('speakers_qualifications')
  @ApiBearerAuth('vault-auth')
  @ApiOperation({
    summary: 'List All speakers  qualifications from Veeva Vault',
  })
  @ApiHeader({
    name: 'auth',
    description: 'Vault Session ID (use /auth endpoint to get it)',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'List All speakers  qualifications from Veeva Vault',
  })
  @ApiResponse({ status: 400, description: 'Missing or invalid token' })
  async listAllSpeakersqualifications(
    @Headers() headers: Record<string, string>,
  ) {
    const authToken = headers['auth'];
    return await this.speakersService.listAllSpeakersqualifications(authToken);
  }

  @Get('speaker_qualification/:id')
  @ApiBearerAuth('vault-auth')
  @ApiOperation({
    summary: 'retreieve speaker  Qualifications by id from Veeva Vault',
  })
  @ApiHeader({
    name: 'auth',
    description: 'Vault Session ID (use /auth endpoint to get it)',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'retreieve speaker Qualifications  by id from Veeva Vault',
  })
  @ApiResponse({ status: 400, description: 'Missing or invalid token' })
  async listAllSpeakerQualificationsById(
    @Headers() headers: Record<string, string>,
    @Param('id') id: string,
  ) {
    const authToken = headers['auth'];
    return await this.speakersService.listAllSpeakerQualificationsById(
      authToken,
      id,
    );
  }
}
