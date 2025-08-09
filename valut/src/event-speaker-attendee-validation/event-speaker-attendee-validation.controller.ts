import {
  Body,
  Controller,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import { EventSpeakerAttendeeValidationService } from './event-speaker-attendee-validation.service';
import { EventIdDto } from './DTOs/event.dto';
import { ApiBody } from '@nestjs/swagger';
import { VaultAuthInterceptor } from 'src/interceptors/vault-auth.interceptor';
import { CustomVaultAuth } from 'src/decorators/vault-auth.decorator';

@Controller('event-speaker-attendee-validation')
export class EventSpeakerAttendeeValidationController {
  constructor(
    private readonly eventSpeakerAttendeeValidationService: EventSpeakerAttendeeValidationService,
  ) {}

  @Post()
  @UseInterceptors(VaultAuthInterceptor)
  @ApiBody({ type: EventIdDto })
  getEventSpeakerAttendeeValidation(
    @Body() data: EventIdDto,
    @CustomVaultAuth() vaultData: any,
  ) {
    const { eventId } = data;

    return this.eventSpeakerAttendeeValidationService.getEventSpeakerAttendeeInfo(
      vaultData,
      eventId,
    );
  }
}
