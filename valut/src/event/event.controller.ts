import {
  Body,
  Controller,
  Get,
  Headers,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { EventService } from './event.service';
import {
  ApiSecurity,
  ApiResponse,
  ApiTags,
  ApiParam,
  ApiBody,
  ApiConsumes,
  ApiHeader,
} from '@nestjs/swagger';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import { QueryVeevaDto } from './dtos/queryVeeva.dto';
import { EventIdDto, UpdateEventDto } from './dtos/updateEvent.dto';
import { ExpansionListWrapperDto } from './dtos/expansion.dto';
import { JwtAuthGuard } from 'src/libs/shared-auth/jwt-auth.guard';
import { AuthHanddOffService } from 'src/auth-handd-off/auth-handd-off.service';
import { log } from 'console';

@ApiTags('vvevent')
@Controller('vvevent')
@ApiSecurity('sessionId')
export class EventController {
  private currentSession: string | null = null;
  private data: any;
  constructor(
    private readonly eventService: EventService,
    private readonly AuthHanddOffService: AuthHanddOffService,
  ) {}

  @EventPattern('vault_auth_response')
  async handleAuthResponse(@Payload() data: any, @Ctx() context: RmqContext) {
    console.log('Auth from RMQ', data);
    const sessionId = data?.sessionId;
    if (!sessionId) {
      context.getChannelRef().nack(context.getMessage(), false, false);
      throw new Error('Session ID missing in payload');
    }
    this.currentSession = sessionId;
    context.getChannelRef().ack(context.getMessage());
    return { status: 'session_received from RMQ', sessionId };
  }

  @Get()
  @ApiResponse({
    status: 200,
    description: 'Successfully fetched events.',
  })
  async getEvents(@Req() req: any) {
    // First try to use the RMQ-provided session
    const res = await this.AuthHanddOffService.handleAuthHandOff();
    this.currentSession = res.sessionId;
    if (this.currentSession) {
      console.log('Using RMQ session:', this.currentSession);
      const res = await this.eventService.getEvents(this.currentSession);
      if (res.data.responseStatus === 'SUCCESS') {
        return res;
      }
    }
    const auth = req.headers['authorization'];
    if (!auth) {
      throw new HttpException(
        'Authorization token is missing',
        HttpStatus.UNAUTHORIZED, // 401 status code
      );
    }
    return await this.eventService.getEvents(auth);
  }

  @Get(':eventId')
  @ApiParam({ name: 'eventId', required: true })
  @ApiResponse({
    status: 200,
    description: 'Successfully fetched event.',
  })
  async getEventById(@Req() req: any, @Param('eventId') eventId: any) {
    // First try to use the RMQ-provided session
    const res = await this.AuthHanddOffService.handleAuthHandOff();
    this.currentSession = res.sessionId;
    if (this.currentSession) {
      console.log('Using RMQ session:', this.currentSession);
      return await this.eventService.getEventById(this.currentSession, eventId);
    }
    const auth = req.headers['authorization'];
    if (!auth) {
      throw new HttpException(
        'Authorization token is missing',
        HttpStatus.UNAUTHORIZED, // 401 status code
      );
    }
    return await this.eventService.getEventById(auth, eventId);
  }

  @Post()
  @ApiBody({
    type: Object,
    description: 'Event object',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully created event.',
  })
  async createEvent(@Req() req: any, @Body() body: any) {
    // First try to use the RMQ-provided session
    if (this.currentSession) {
      console.log('Using RMQ session:', this.currentSession);
      return await this.eventService.createEvent(this.currentSession, body);
    }
    const auth = req.headers['authorization'];
    if (!auth) {
      throw new HttpException(
        'Authorization token is missing',
        HttpStatus.UNAUTHORIZED, // 401 status code
      );
    }
    return await this.eventService.createEvent(auth, body);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':eventId')
  @ApiConsumes('application/x-www-form-urlencoded')
  @ApiParam({ name: 'eventId', description: 'ID of the event to update' })
  @ApiBody({
    type: UpdateEventDto,
    description: 'Event object',
    required: true,
  })
  @ApiResponse({ status: 200, description: 'Event updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async updateEvent(
    @Req() req: any,
    @Param('eventId') eventId: string,
    @Body() body: any,
  ) {
    // First try to use the RMQ-provided session
    if (this.currentSession) {
      console.log('Using RMQ session:', this.currentSession);
      return await this.eventService.updateEvent(
        this.currentSession,
        eventId,
        body,
      );
    }
    const auth = req.headers['authorization'];
    if (!auth) {
      throw new HttpException(
        'Authorization token is missing',
        HttpStatus.UNAUTHORIZED, // 401 status code
      );
    }
    return await this.eventService.updateEvent(auth, eventId, body);
  }

  @Post('event-structured/:eventId')
  @ApiParam({ name: 'eventId', required: true })
  @ApiBody({ type: ExpansionListWrapperDto })
  @ApiHeader({
    name: 'auth',
    description: 'Token JWT',
    required: true,
  })
  async getStructuredEvent(
    @Param('eventId') eventId: string,
    @Body() body: ExpansionListWrapperDto,
  ) {
    const res = await this.AuthHanddOffService.handleAuthHandOff();
    let auth = res.sessionId;
    if (!auth) {
      throw new HttpException(
        'Authorization token is missing',
        HttpStatus.UNAUTHORIZED, // 401 status code
      );
    }
    return await this.eventService.getEventDetails(
      eventId,
      auth,
      body.expansionList,
    );
  }

  @EventPattern('centris_to_vaultt')
  async handleCentrisToVault(
    @Payload() data: any,
    @Ctx() context: RmqContext,
  ): Promise<any> {
    const res = await this.AuthHanddOffService.handleAuthHandOff();
    this.data = data;
    try {
      const result = await this.eventService.eventToVault(data, res);
      context.getChannelRef().ack(context.getMessage());
      console.log('Event processed successfully:', result);
      return result;
    } catch (error) {
      console.error('Error processing message:', error);
      context.getChannelRef().nack(context.getMessage(), false, false);
      return { error: 'Failed to process message' };
    }
  }

  @Post('to/vault')
  async eventToVaultHttp(@Body() body: any): Promise<any> {
    const auth = this.currentSession;
    body = this.data;
    return this.eventService.eventToVault(body, auth);
  }
}
