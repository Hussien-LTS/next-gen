import {
  Body,
  Controller,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { EventPattern, Payload, Ctx, RmqContext } from '@nestjs/microservices';
import { SpeakerValidationService } from './speaker-validation.service';
import { EventSpeakerIdDto } from './DTOs/speaker-validation.dto';
import { VeevaAuthDTO } from '../shared/DTOs/vault-auth.dto';
import { SessionStoreService } from 'src/sessionValidation/sessionValidation.service';

@Controller('vault/api/v1/getSpeakerValidationDetails')
export class SpeakerValidationController {
  private sessionId: string;

  constructor(
    private readonly speakerValidationService: SpeakerValidationService,
    private readonly sessionStore: SessionStoreService,
  ) {}

  @EventPattern('vault_auth_response')
  handleVaultAuth(@Payload() data: VeevaAuthDTO, @Ctx() context: RmqContext) {
    this.sessionId = data?.sessionId;
    if (!this.sessionId) {
      context.getChannelRef().nack(context.getMessage(), false, false);
      throw new ForbiddenException();
    }
    this.sessionStore.set(this.sessionId);
  }

  @Post()
  async validateSpeaker(@Body() vaultEventSpeakerIdDto: EventSpeakerIdDto) {
    const { vaultEventSpeakerId } = vaultEventSpeakerIdDto;

    if (!this.sessionId) {
      throw new UnauthorizedException('Missing vault session ID');
    }

    if (!vaultEventSpeakerId) {
      throw new HttpException('Missing speaker ID', HttpStatus.BAD_REQUEST);
    }

    return await this.speakerValidationService.getEventSpeakerInfo(
      this.sessionId,
      vaultEventSpeakerId,
    );
  }
}
