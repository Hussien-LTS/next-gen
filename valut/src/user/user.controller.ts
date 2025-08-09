import {
  BadRequestException,
  Body,
  Controller,
  Post,
  UnauthorizedException,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserService } from './user.service';
import { UserIdDto } from './DTOs/user-ids.dto';
import { VeevaAuthDTO } from '../shared/DTOs/vault-auth.dto';

@ApiTags('User')
@Controller('vault/v1/users')
export class UserController {
  private currentSession: string | null = null;
  constructor(private readonly userService: UserService) {}
  @EventPattern('vault_auth_response')
  handleAuthResponse(
    @Payload() data: VeevaAuthDTO,
    @Ctx() context: RmqContext,
  ) {
    console.log('Auth from RMQ', data);
    console.log('Auth from RMQ SessionID (Veeva  Vault) ', data.sessionId);

    const sessionId = data?.sessionId;
    if (!sessionId) {
      context.getChannelRef().nack(context.getMessage(), false, false);
      throw new Error('Session ID missing in payload');
    }
    this.currentSession = sessionId;
    return { status: 'session_received from RMQ', sessionId };
  }

  @Post()
  @UsePipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  )
  @ApiOperation({ summary: 'Get user info with session validation' })
  @ApiBody({ type: UserIdDto })
  async getUserInfo(@Body() data: UserIdDto) {
    if (!this.currentSession) {
      throw new UnauthorizedException('Authorization token is missing');
    }
    if (!data) {
      throw new BadRequestException('missing body');
    }
    return await this.userService.getUserInfo(data, this.currentSession);
  }
}
