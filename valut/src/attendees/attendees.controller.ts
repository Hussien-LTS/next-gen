/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */

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
import { AttendeesService } from './attendees.service';
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
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import { AuthHanddOffService } from 'src/auth-handd-off/auth-handd-off.service';

@ApiTags('attendees')
@Controller('attendees')
export class AttendeesController {
  constructor(
    private readonly attendeesService: AttendeesService,
    private readonly AuthHanddOffService: AuthHanddOffService,
  ) {}

  @EventPattern('salesforce-attendee-external-ids')
  async getAttendeeListByExternalId(
    @Payload() data: Record<string, unknown>,
    @Ctx() context: RmqContext,
  ) {
    console.log('Data from RMQ', data);
    if (!data) {
      context.getChannelRef().nack(context.getMessage(), false, false);
      throw new Error('data missing in payload');
    }

    const vaultCredentials =
      (await this.AuthHanddOffService.handleAuthHandOff()) as {
        sessionId: string;
        clientId: string;
        serverUrl: string;
      };

    // ! todo important discuss this issue
    vaultCredentials.serverUrl = `${vaultCredentials?.serverUrl}/api/v25.1`;

    const externalIds = data?.externalIds as string[];
    const transactionLogName = data?.transactionLogName as string;
    const reqToken = data?.reqToken as Record<string, unknown>;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const result = await this.attendeesService.getAttendeeListByExternalId(
      vaultCredentials,
      externalIds,
      transactionLogName,
      reqToken,
    );
    context.getChannelRef().ack(context.getMessage());

    return result;
  }

  @EventPattern('salesforce-list-attendees-by-external-ids-transaction-log')
  async createAttendeeListTransactionLog(
    @Payload() data: Record<string, unknown>,
    @Ctx() context: RmqContext,
  ) {
    console.log('Data from RMQ', data);
    if (!data) {
      context.getChannelRef().nack(context.getMessage(), false, false);
      throw new Error('data missing in payload');
    }

    const result =
      await this.attendeesService.createAttendeeListTransactionLog(data);
    context.getChannelRef().ack(context.getMessage());

    return result;
  }

  @Get()
  @ApiBearerAuth('vault-auth')
  @ApiOperation({ summary: 'List All attendees from Veeva Vault' })
  @ApiHeader({
    name: 'auth',
    description: 'Vault Session ID (use /auth endpoint to get it)',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'List of all attendees from Veeva Vault',
  })
  @ApiResponse({ status: 400, description: 'Missing or invalid token' })
  async listAllattendees(@Headers() headers: Record<string, string>) {
    const authToken = headers['auth'];
    return await this.attendeesService.listAllattendees(authToken);
  }

  @Get(':id')
  @ApiBearerAuth('vault-auth')
  @ApiOperation({ summary: 'List All attendee from Veeva Vault' })
  @ApiHeader({
    name: 'auth',
    description: 'Vault Session ID (use /auth endpoint to get it)',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'retreive an attendee by id from Veeva Vault',
  })
  @ApiResponse({ status: 400, description: 'Missing or invalid token' })
  async listAttendeeById(
    @Headers() headers: Record<string, string>,
    @Param('id') id: string,
  ) {
    const authToken = headers['auth'];
    return await this.attendeesService.listAttendeeById(authToken, id);
  }

  @Get('events_attendees')
  @ApiBearerAuth('vault-auth')
  @ApiOperation({ summary: 'List All events_attendees from Veeva Vault' })
  @ApiHeader({
    name: 'auth',
    description: 'Vault Session ID (use /auth endpoint to get it)',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'List of all events_attendees from Veeva Vault',
  })
  @ApiResponse({ status: 400, description: 'Missing or invalid token' })
  async listAllevents_attendees(@Headers() headers: Record<string, string>) {
    const authToken = headers['auth'];
    return await this.attendeesService.listAllevents_attendees(authToken);
  }
  @Get('event_attendee/:id')
  @ApiBearerAuth('vault-auth')
  @ApiOperation({ summary: 'List All attendee from Veeva Vault' })
  @ApiHeader({
    name: 'auth',
    description: 'Vault Session ID (use /auth endpoint to get it)',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'retreive an attendee by id from Veeva Vault',
  })
  @ApiResponse({ status: 400, description: 'Missing or invalid token' })
  async listAllEventAttendeeById(
    @Headers() headers: Record<string, string>,
    @Param('id') id: string,
  ) {
    const authToken = headers['auth'];
    return await this.attendeesService.listAllEventAttendeeById(authToken, id);
  }
  @Put(':attendeeId')
  @ApiConsumes('application/x-www-form-urlencoded')
  @ApiParam({ name: 'attendeeId', description: 'ID of the attendee to update' })
  @ApiBearerAuth('vault-auth')
  @ApiOperation({ summary: 'Update attendee by id in Veeva Vault' })
  @ApiHeader({
    name: 'auth',
    description: 'Vault Session ID (use /auth endpoint to get it)',
    required: true,
  })
  @ApiBody({
    type: Object,
    description: 'attendee Object',
    required: true,
  })
  @ApiResponse({ status: 200, description: 'attendee updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async updateattendee(
    @Headers() headers: Record<string, string>,
    @Param('attendeeId') attendeeId: string,
    @Body() body: any,
  ) {
    const authToken = headers['auth'];
    if (!authToken) {
      throw new HttpException(
        'Missing Authorization header',
        HttpStatus.BAD_REQUEST,
      );
    }
    return await this.attendeesService.updateAttendee(
      authToken,
      attendeeId,
      body,
    );
  }
}
