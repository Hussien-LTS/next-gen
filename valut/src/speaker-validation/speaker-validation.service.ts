import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { EventSpeakerIdDto } from './DTOs/speaker-validation.dto';
import * as qs from 'qs';
import {
  mapSpeakerValidationToHCPEligibility,
  speakerValidationMapper,
} from './speaker-validation.mapper';
import { TRANSACTION_DIRECTIONS } from 'src/shared/constants/transaction-log-dirction';
import { mapTransactionLogPayload } from 'src/shared/transactionLog/mapTransactionLogPayload';
import { v4 as uuidv4 } from 'uuid';
import { RabbitMQService } from 'src/shared/rabbitmq/rabbitmq.service';
import { sendVQL } from 'src/shared/vaultReq/sendVQL';

@Injectable()
export class SpeakerValidationService {
  private readonly logger = new Logger(SpeakerValidationService.name);
  private readonly clientId: string | undefined;
  private readonly baseUrl: string | undefined;

  constructor(
    private readonly configService: ConfigService,
    private rmqService: RabbitMQService,
  ) {
    this.baseUrl = this.configService.get<string>('VAULT_BASE_URL');
    this.clientId = this.configService.get<string>('VAULT_CLIENT_ID');
  }

  async getEventSpeakerInfo(authToken: string, speakerId: string) {
    try {
      console.log('🚀 ~ SpeakerValidationService ~ speakerId:', speakerId);
      if (!authToken) {
        throw new HttpException(
          'Missing Authorization header',
          HttpStatus.BAD_REQUEST,
        );
      }
      const query = `SELECT id,event__vr.centris_id__c,account__v, event__v, object_type__vr.name__v, event__vr.status__v,event__vr.start_date__v ,event__vr.end_date__v ,object_type__vr.name__v,id,event__vr.topic__v,event__vr.country__v,event__vr.topic__v
FROM em_event_speaker__v 
WHERE (id = '${speakerId}')`;

      const eventSpeakerRes = await sendVQL(
        this.baseUrl,
        this.clientId,
        query,
        authToken,
      );
      console.log(
        '🚀 ~ SpeakerValidationService ~ getEventSpeakerInfo ~ eventSpeakerRes:',
        eventSpeakerRes,
      );

      if (!eventSpeakerRes?.data[0]?.event__v)
        throw new BadRequestException('Speaker not assigned to any event');
      if (!eventSpeakerRes?.data[0]?.account__v)
        throw new BadRequestException('Invalid account');

      const accountRes = await this.getAccountInfo(
        authToken,
        eventSpeakerRes?.data[0]?.account__v,
      );

      const eventInfo = await this.getEventInfo(
        authToken,
        eventSpeakerRes?.data[0]?.event__v,
      );
      const transactionName = uuidv4();

      const speakerFullData = {
        dataSourceSpeaker: mapSpeakerValidationToHCPEligibility(
          eventSpeakerRes?.data[0],
          eventInfo[0],
        ),
        centriesSpeaker: speakerValidationMapper(
          '',
          eventSpeakerRes?.data[0],
          eventInfo[0],
          accountRes[0],
        ),
        transactionName,
      };
      const savedSpeakerDate = await this.rmqService.send(
        'speaker-validation-created',
        speakerFullData,
      );

      let transactionLogRes;
      if (savedSpeakerDate?.response?.error) {
        throw new BadRequestException(savedSpeakerDate?.response?.message);
      } else
        transactionLogRes = await this.rmqService.send(
          'transaction-log',
          mapTransactionLogPayload({
            name: transactionName,
            direction: TRANSACTION_DIRECTIONS.VAULT_INBOUND,
            logType: 'Speaker',
            success: 'true',
          }),
        );

      const speakerData = speakerValidationMapper(
        transactionLogRes?.data?.Id,
        eventSpeakerRes?.data[0],
        eventInfo[0],
        accountRes[0],
      );
      console.log(
        '🚀 ~ SpeakerValidationService ~ getEventSpeakerInfo ~ speakerData:',
        speakerData,
      );
      return speakerData;
    } catch (error) {
      await this.rmqService.emit(
        'transaction-log',
        mapTransactionLogPayload({
          name: uuidv4(),
          direction: TRANSACTION_DIRECTIONS.VAULT_INBOUND,
          logType: 'Speaker',
          success: 'false',
          errorMessage: error?.message,
        }),
      );
      return {
        isError: true,
        message: error.message,
      };
    }
  }

  async getEventInfo(authToken: string, eventId: string) {
    const query = `SELECT country__vr.name__v
FROM em_event__v 
WHERE (id = '${eventId}')`;
    const eventInfo = await await sendVQL(
      this.baseUrl,
      this.clientId,
      query,
      authToken,
    );
    if (!eventInfo?.data) throw new BadRequestException('Invalid event ID');
    return eventInfo?.data;
  }

  async getAccountInfo(authToken: string, accountId: string) {
    const query = `SELECT external_id__v
FROM account__v 
WHERE (id = '${accountId}')`;
    const accountInfo = await sendVQL(
      this.baseUrl,
      this.clientId,
      query,
      authToken,
    );
    if (!accountInfo?.data) throw new BadRequestException('Invalid event ID');
    return accountInfo?.data;
  }
}
