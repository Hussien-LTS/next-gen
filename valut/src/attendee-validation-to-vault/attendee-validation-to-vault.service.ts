import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { RabbitMQService } from 'src/shared/rabbitmq/rabbitmq.service';
import { SyncAttendeeDto } from './DTOs/attendee-validation-sync.dto';
import {
  mapCopmletedEventBody,
  mapDraftEventBody,
} from './attendee-validation-to-vault.mapper';
import axios from 'axios';
import { mapTransactionLogPayload } from 'src/shared/transactionLog/mapTransactionLogPayload';
import { TRANSACTION_DIRECTIONS } from 'src/shared/constants/transaction-log-dirction';
import { sendVQL } from 'src/shared/vaultReq/sendVQL';

@Injectable()
export class AttendeeValidationToVaultService {
  private clientId: string;
  private baseUrl: string;

  constructor(private rmqService: RabbitMQService) {}
  private getHeaders(authorization: string, clientId: string) {
    return {
      Authorization: authorization || '',
      Accept: '*/*',
      'X-VaultAPI-ClientID': clientId,
    };
  }

  async syncEventAttendeeInfo(payload: SyncAttendeeDto, vaultAuth: any) {
    console.log(
      '🚀 ~ AttendeeValidationToVaultService ~ syncEventAttendeeInfo ~ payload:',
      payload,
    );

    try {
      const { sessionId, clientId, serverUrl } = vaultAuth;
      console.log(
        '🚀 ~ AttendeeValidationToVaultService ~ syncEventAttendeeInfo ~ vaultAuth:',
        vaultAuth,
      );

      if (!sessionId || !clientId || !serverUrl) {
        throw new UnauthorizedException('Missing Vault auth');
      }

      this.baseUrl = serverUrl;
      this.clientId = clientId;

      const event = await this.getEventInfo(sessionId, payload.eventId);
      console.log(
        '🚀 ~ AttendeeValidationToVaultService ~ syncEventAttendeeInfo ~ event:',
        event,
      );

      if (!event) {
        throw new BadRequestException('Attendee not assigned to event');
      }

      const eventStatues = this.checkEventStatues(event.em_event_status__v);
      const updateAttendeeBody =
        eventStatues === 'draft'
          ? mapDraftEventBody(payload)
          : mapCopmletedEventBody(payload);

      const params = new URLSearchParams();

      for (const key in updateAttendeeBody) {
        if (updateAttendeeBody.hasOwnProperty(key)) {
          params.append(key, updateAttendeeBody[key]);
        }
      }

      const updatedAttendee = await axios.put(
        `${this.baseUrl}/api/v25.1/vobjects/em_attendee__v/${payload.eventAttendeeId}`,
        params.toString(),
        {
          headers: {
            ...this.getHeaders(sessionId, clientId),
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );
      console.log(
        '🚀 ~ AttendeeValidationToVaultService ~ syncEventAttendeeInfo ~ updatedAttendee:',
        updatedAttendee.data,
      );

      
      if (updatedAttendee?.data?.errors) {
        throw new BadRequestException(
          updatedAttendee?.data?.errors[0]?.message,
        );
      } else {
        console.log(
          '🚀 ~ AttendeeValidationToVaultService ~ syncEventAttendeeInfo ~ payload?.transactionName:',
          payload?.transactionName,
        );
        
        payload?.transactionName &&
        //!send
          (await this.rmqService.emit(
            'transaction-log',
            mapTransactionLogPayload({
              name: payload?.transactionName,
              direction: TRANSACTION_DIRECTIONS.VAULT_OUTBOUND,
              logType: 'Attendee to vault',
              success: 'true',
            }),
          ));
      }
      return {
        success: true,
        message: 'Attendee Validation Successfully updated in Vault',
      };
    } catch (error: any) {
      console.log('🚀 ~ error:', error);
      payload?.transactionName &&
        (await this.rmqService.send(
          'transaction-log',
          mapTransactionLogPayload({
            name: payload.transactionName,
            direction: TRANSACTION_DIRECTIONS.VAULT_OUTBOUND,
            logType: 'Attendee',
            success: 'false',
            errorMessage: error?.message,
          }),
        ));
      throw new BadRequestException(
        error?.message || 'Failed to fetch Attendee info from Veeva Vault',
      );
    }
  }

  async getEventInfo(authToken: string, eventId: string) {
    const query = `SELECT em_event_status__v
  FROM em_event__v 
  WHERE (id = '${eventId}')`;
    const eventInfo = await sendVQL(
      this.baseUrl,
      this.clientId,
      query,
      authToken,
    );
    console.log(
      '🚀 ~ AttendeeValidationToVaultService ~ getEventInfo ~ eventInfo:',
      eventInfo,
    );

    if (!eventInfo) throw new BadRequestException('Invalid event ID');
    return eventInfo;
  }

  checkEventStatues(eventStatues) {
    if (eventStatues == 'draft_vpro__c') return 'draft';
    else return 'completed';
  }
}
