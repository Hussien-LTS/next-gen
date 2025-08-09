import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';
import { RabbitMQService } from 'src/shared/rabbitmq/rabbitmq.service';
import { TRANSACTION_DIRECTIONS } from 'src/shared/constants/transaction-log-dirction';
import { mapTransactionLogPayload } from 'src/shared/transactionLog/mapTransactionLogPayload';
import { sendVQL } from 'src/shared/vaultReq/sendVQL';
import {
  mapCopmletedEventBody,
  mapDraftEventBody,
} from './speaker-validation-to-vault.mapper';
import { SyncSpeakerDto } from './DTOs/speaker-validation-sync.dto';
import { v4 as uuidv4 } from 'uuid';
import { URLSearchParams } from 'url';

@Injectable()
export class SpeakerValidationToVaultService {
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

  async syncEventSpeakerInfo(payload: SyncSpeakerDto, vaultAuth: any) {
    console.log(
      '🚀 ~ SpeakerValidationToVaultService ~ syncEventSpeakerInfo ~ payload:',
      payload,
    );
    try {
      const { sessionId, clientId, serverUrl } = vaultAuth;
      console.log(
        '🚀 ~ SpeakerValidationToVaultService ~ syncEventSpeakerInfo ~ vaultAuth:',
        vaultAuth,
      );
      if (!sessionId || !clientId || !serverUrl) {
        throw new UnauthorizedException('Missing Vault auth');
      }

      this.baseUrl = serverUrl;
      this.clientId = clientId;

      const event = await this.getEventInfo(sessionId, payload.eventId);
      console.log(
        '🚀 ~ SpeakerValidationToVaultService ~ syncEventSpeakerInfo ~ event:',
        event,
      );
      if (!event) {
        throw new BadRequestException('Speaker not assigned to event');
      }

      const eventStatues = this.checkEventStatues(event.em_event_status__v);
      const updateSpeakerBody =
        eventStatues === 'draft'
          ? mapDraftEventBody(payload)
          : mapCopmletedEventBody(payload);

      const params = new URLSearchParams();

      for (const key in updateSpeakerBody) {
        if (updateSpeakerBody.hasOwnProperty(key)) {
          params.append(key, updateSpeakerBody[key]);
        }
      }

      const updatedSpeaker = await axios.put(
        `${this.baseUrl}/api/v25.1/vobjects/em_event_speaker__v/${payload.eventSpeakerId}`,
        params.toString(),
        {
          headers: {
            ...this.getHeaders(sessionId, clientId),
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );
      console.log(
        '🚀 ~ SpeakerValidationToVaultService ~ updatedSpeaker:',
        updatedSpeaker.data,
      );

      if (updatedSpeaker?.data?.errors) {
        throw new BadRequestException(updatedSpeaker?.data?.errors[0]?.message);
      } else
        payload?.transactionName &&
          (await this.rmqService.send(
            'transaction-log',
            mapTransactionLogPayload({
              name: payload?.transactionName,
              direction: TRANSACTION_DIRECTIONS.VAULT_OUTBOUND,
              logType: 'Speaker',
              success: 'true',
            }),
          ));

      return {
        success: true,
        message: 'Speaker Validation Successfully updated in Vault',
      };
    } catch (error: any) {
      console.log('🚀 ~ error:', error);
      payload?.transactionName &&
        (await this.rmqService.send(
          'transaction-log',
          mapTransactionLogPayload({
            name: payload.transactionName,
            direction: TRANSACTION_DIRECTIONS.VAULT_OUTBOUND,
            logType: 'Speaker',
            success: 'false',
            errorMessage: error?.message,
          }),
        ));
      throw new BadRequestException(
        error?.message || 'Failed to fetch speaker info from Veeva Vault',
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
      '🚀 ~ SpeakerValidationToVaultService ~ getEventInfo ~ eventInfo:',
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
