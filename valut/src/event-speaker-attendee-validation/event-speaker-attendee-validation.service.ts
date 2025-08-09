import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { sendVQL } from 'src/shared/vaultReq/sendVQL';
import { SpeakerValidationService } from 'src/speaker-validation/speaker-validation.service';
import { SubmissionStatusDto } from './DTOs/event.dto';

@Injectable()
export class EventSpeakerAttendeeValidationService {
  private  clientId: string;
  private  baseUrl: string;

  constructor(
    private speakerValidationService: SpeakerValidationService,
  ) {}
  async getEventSpeakerAttendeeInfo(vaultAuth, eventId) {
    try {
      if (!vaultAuth.sessionId || !vaultAuth.clientId || !vaultAuth.serverUrl) {
        throw new UnauthorizedException('Missing Vault auth');
      }
      const { sessionId, clientId, serverUrl } = vaultAuth;
      this.clientId = clientId;
      this.baseUrl = `${serverUrl}/api/v25.1`;
      if (!sessionId) {
        return new UnauthorizedException('session ID missed');
      }

      const eventSpeakerData = await this.getEventParticipantInfo(
        sessionId,
        eventId,
        'em_event_speaker__v',
      );
      if (eventSpeakerData.length === 0) {
        return 'No speaker requires eligibility check.';
      } else {
        const pendingParticipants = await this.validateParticipant(
          sessionId,
          eventSpeakerData,
        );
        return { eventId, pendingParticipants };
      }
    } catch (error) {
      return new BadRequestException(error.message);
    }
  }

  async getEventParticipantInfo(sessionId, eventId, vaultObj) {
    const query = `select id,ineligible_at_time_of_submission__c from ${vaultObj} where ineligible_at_time_of_submission__c=true AND (event__v='${eventId}')`;
    const participantInfo = await sendVQL(
      this.baseUrl,
      this.clientId,
      query,
      sessionId,
    );
    console.log(
      '🚀 ~ EventSpeakerAttendeeValidationService ~ getEventParticipantInfo ~ participantInfo:',
      participantInfo,
    );

    if (!participantInfo?.data)
      throw new BadRequestException('Invalid event ID');
    return participantInfo.data;
  }

  async validateParticipant(
    vaultAuth: string,
    participantData: SubmissionStatusDto[],
  ) {
    console.log("🚀 ~ EventSpeakerAttendeeValidationService ~ validateParticipant ~ vaultAuth:", vaultAuth)
    const validationPromises = participantData?.map(async (item) => {
      const response = await this.speakerValidationService.getEventSpeakerInfo(
        vaultAuth,
        item?.id,
      );
      console.log('Response:', response);

      if ('isError' in response) return null;

      return {
        eventSpeakerId: response?.eventSpeakerId?.[0],
        isEligible: response?.status,
      };
    });

    const resolvedResults = await Promise.all(validationPromises);
    return resolvedResults.filter(Boolean);
  }
}
