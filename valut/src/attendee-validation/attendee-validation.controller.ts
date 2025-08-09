import { Body, Controller, ForbiddenException, HttpException, HttpStatus, Post, UnauthorizedException } from '@nestjs/common';
import { AttendeeValidationService } from './attendee-validation.service';
import { SessionStoreService } from 'src/sessionValidation/sessionValidation.service';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import { VeevaAuthDTO } from 'src/shared/DTOs/vault-auth.dto';
import { EventAttendeeIdDto } from './DTOs/attendee-validation.dto';

@Controller('vault/api/v1/getAttendeeValidationDetails')
export class AttendeeValidationController {
     private sessionId: string;
    
      constructor(
        private readonly attendeeValidationService: AttendeeValidationService,
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
      async validateAttendee(@Body() vaultEventAttendeeIdDto: EventAttendeeIdDto) {
        console.log("🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀 ~ AttendeeValidationController ~ validateAttendee ~ vaultEventAttendeeIdDto:", vaultEventAttendeeIdDto)
        const { vaultEventAttendeeId } = vaultEventAttendeeIdDto;
    
        if (!this.sessionId) {
          throw new UnauthorizedException('Missing vault session ID');
        }
    
        if (!vaultEventAttendeeId) {
          throw new HttpException('Missing Attendee ID', HttpStatus.BAD_REQUEST);
        }
    
        return await this.attendeeValidationService.getEventAttendeeInfo(
          this.sessionId,
          vaultEventAttendeeId,
        );
      }
    }
    
