import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { RabbitMQService } from 'src/shared/rabbitmq/rabbitmq.service';
import { UpdateEventDto } from './dtos/updateEvent.dto';
import * as qs from 'qs';
import { EventByIdVO } from './vos/event_response.vo';
import { ExpansionListDto } from './dtos/expansion.dto';
@Injectable()
export class EventService {
  private readonly logger = new Logger(EventService.name);
  private readonly clientId: any;
  private readonly baseUrl: any;
  constructor(
    private readonly configService: ConfigService,
    private rmqService: RabbitMQService,
  ) {
    this.baseUrl = this.configService.get<string>('VAULT_BASE_URL');
    this.clientId = this.configService.get<string>('VAULT_CLIENT_ID');
  }
  async getEvents(authToken: string): Promise<any> {
    const clientId = this.clientId;
    const config = {
      method: 'get' as const,
      url: `${this.baseUrl}/vobjects/em_event__v`,
      headers: {
        Authorization: authToken,
        Accept: 'application/json',
        'X-VaultAPI-ClientID': this.clientId,
      },
    };
    if (!authToken || !clientId) {
      throw new HttpException(
        'Authorization token is missing or Client Id',
        401,
      );
    }
    try {
      this.logger.log('Fetching event');
      const res = await axios.request(config);
      if (!res) {
        this.logger.log('Event Not fetched!');
      }
      await this.rmqService.emit(`All_event_data`, res.data as EventByIdVO);
      return {
        data: res.data as EventByIdVO,
      };
    } catch (error) {
      throw new HttpException(
        error.response?.data || 'Failed to fetch event',
        error.response?.status || 500,
        error.message ?? error,
      );
    }
  }

  async getEventById(authToken: string, eventId: string): Promise<any> {
    const clientId = this.clientId;
    const config = {
      method: 'get' as const,
      url: `${this.baseUrl}/vobjects/em_event__v/${eventId}`,
      headers: {
        Authorization: authToken,
        Accept: 'application/json',
        'X-VaultAPI-ClientID': clientId,
      },
    };
    if (!authToken) {
      throw new HttpException('Authorization token is missing', 401);
    }
    try {
      this.logger.log(`Fetching event : ${eventId}`);
      const res = await axios.request(config);
      if (res.data.responseStatus === 'SUCCESS') {
        this.logger.log(`Fetching event : ${eventId} successfully`);
      }
      const eventByIdVO: EventByIdVO = res.data as EventByIdVO;
      await this.rmqService.emit(`event_vault_data`, eventByIdVO.data);
      return {
        data: eventByIdVO.data,
      };
    } catch (error) {
      throw new HttpException(
        error.response?.data || 'Failed to fetch event',
        error.response?.status || 500,
        error.message ?? error,
      );
    }
  }

  async createEvent(authToken: string, body: any): Promise<any> {
    const clientId = this.clientId;
    const config = {
      method: 'post' as const,
      url: `${this.baseUrl}/vobjects/em_event__v`,
      data: body,
      headers: {
        Authorization: authToken,
        Accept: 'application/json',
        'X-VaultAPI-ClientID': clientId,
      },
    };
    if (!authToken) {
      throw new HttpException('Authorization token is missing', 401);
    }
    try {
      const res = await axios.request(config);
      if (res.data.responseStatus === 'SUCCESS') {
        this.logger.log(`Event Created successfully`);
      }
      return {
        msg: 'Event Created SUCCESS',
        data: res.data,
      };
    } catch (error) {
      throw new HttpException(
        error.response?.data || 'Failed to fetch event',
        error.response?.status || 500,
        error.message ?? error,
      );
    }
  }

  async updateEvent(
    authToken: string,
    eventId: string,
    body: UpdateEventDto,
  ): Promise<any> {
    const clientId = this.clientId;
    const record: Record<string, string> = {
      [body.fieldName]: body.value,
    };
    const config = {
      method: 'put' as const,
      maxBodyLength: Infinity,
      url: `${this.baseUrl}/vobjects/em_event__v/${eventId}`,
      data: record,
      headers: {
        Authorization: authToken,
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-VaultAPI-ClientID': clientId,
      },
    };
    if (!authToken) {
      throw new HttpException(
        'Authorization token is missing',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const res = await axios.request(config);
      if (!(res.data.responseStatus === 'SUCCESS')) {
        this.logger.log(`Event not updated !`);
      }
      const eventDataUpdated = await this.getEventById(authToken, eventId);
      await this.rmqService.emit(`updated_eventId_data`, {
        data: res.data,
        eventDataUpdated,
      });
      return {
        msg: 'Event Updated SUCCESS and data sent to RMQ',
        data: res.data,
      };
    } catch (error) {
      throw new HttpException(
        error.response?.data || 'Failed to fetch event',
        error.response?.status || 500,
        error.message ?? error,
      );
    }
  }
  private async makeVqlQuery(vql: string, authToken: string): Promise<any> {
    const clientId = this.clientId;
    const data = qs.stringify({ q: vql });
    const config = {
      method: 'post',
      url: `${this.baseUrl}/query`,
      headers: {
        Authorization: authToken,
        Accept: 'application/json',
        'X-VaultAPI-DescribeQuery': 'true',
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-VaultAPI-ClientID': clientId,
      },
      data,
    };
    try {
      const response = await axios.request(config);
      return response.data;
    } catch (error) {
      throw new BadRequestException('Veeva VQL query failed');
    }
  }
  async getEventDetails(
    eventId: string,
    authToken: string,
    expansionList: ExpansionListDto[],
  ) {
    if (!eventId) {
      throw new BadRequestException('eventId is required');
    }
    // const expansionValidation = await this.rmqService.send(
    //   'expansion_validation',
    //   { expansionList },
    // );
    // if (!expansionValidation) {
    //   throw new BadRequestException(
    //     'expansionList is required & keys not provided on db',
    //   );
    // }
    const eventQuery = `
  SELECT id, object_type__v, name__v, status__v, created_by__v, created_date__v, modified_by__v, modified_date__v, 
  actual_cost__v, attendee_reconciliation_complete__v, city__v, committed_cost__v, description__v, 
  end_date__v, end_time__v, estimated_attendance__v, estimated_cost__v, external_id__v, event_display_name__v, 
  location__v, postal_code__v,
  start_date__v, start_time__v, state_province__v, em_event_status__v, 
  venue__v, ownerid__v, stage__v, address__v, country__v, cancellation_reason__v, time_zone__v, 
  start_time_local__v, end_time_local__v, ahm_planning_status__c, approval_comment__c, centris_id__c, 
  event_approval_type__c, approval_submitter__c, approval_submitter__cr.status__v, approval_submitter__cr.modified_by__v, 
  approval_submitter__cr.modified_date__v, 
  (SELECT id, name__v, status__v FROM em_event_speaker__vr), 
  (SELECT id, name__v, status__v FROM expense_estimate__vr), 
  (SELECT id, name__v, status__v FROM expense_header__vr), 
  (SELECT id, name__v, status__v FROM event_attendees__vr), 
  (SELECT id, name__v, status__v FROM em_event_team_member__vr)
  FROM em_event__v 
    WHERE id = '${eventId}'`;
    const attendeeQuery = `
  SELECT attendee_name__v, walk_in_status__v,
   centris_id__c, title__v, attendee_type__v,
    phone__v, id, name__v, modified_date__v, city__v,
     email__v, external_id__v, first_name__v, meal_opt_in__v,
      zip__v, event__v, ineligible_reason_at_time_of_attendance__c,
       ineligible_reason_at_time_of_creation__c, ineligible_reason_at_time_of_rsvp__c, ineligible_reason_at_time_of_submission__c, ineligible_at_time_of_attendance__c, ineligible_at_time_of_creation__c, ineligible_at_time_of_rsvp__c, ineligible_at_time_of_submission__c, address_line_1__v, last_name__v, external_id_on24__v 
    FROM em_attendee__v 
    WHERE (event__v = '${eventId}')`;
    const [eventResponse, attendeeResponse]: any[] = await Promise.all([
      this.makeVqlQuery(eventQuery, authToken),
      this.makeVqlQuery(attendeeQuery, authToken),
    ]);
    const eventData = eventResponse?.data?.[0];
    const attendeeData = attendeeResponse?.data || [];
    eventData.expansionList = expansionList;
    const limitedAttendeeData = attendeeData.slice(0, 10);
    eventData.attendeeData = limitedAttendeeData;
    console.log('Combined Data:', eventData);
    const centrisRes = await this.rmqService.send(
      'event_vault_Fdata',
      eventData,
    );
    console.log('Centris Response:', centrisRes);
    return {
      CentrisData: centrisRes,
      VaultData: eventData,
      attendeeData,
    };
  }

  async eventToVault(body: any, auth: any) {
    console.log('bodyyyyy', body);
    try {
      const clientId = this.clientId;
      const data = qs.stringify(body);
      console.log(data);
      const config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: `${auth.serverUrl}/api/v25.1/vobjects/em_event__v?idParam=external_id__v`,
        headers: {
          Authorization: auth.sessionId,
          Accept: 'application/json',
          'X-VaultAPI-ClientID': auth.clientId,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        data,
      };
      const response = await axios.request(config);
      await this.rmqService.emit('event-to-vault', response.data);
      return response.data;
    } catch (error) {
      console.error('Vault API error:', error.response?.data || error.message);
      throw new Error('Failed to send event to Vault');
    }
  }
}
