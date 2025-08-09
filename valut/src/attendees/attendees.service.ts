import {
  Headers,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import * as qs from 'qs';
import { RabbitMQService } from 'src/shared/rabbitmq/rabbitmq.service';
import {
  TRANSACTION_SUCCESS_STATUSES,
  TRANSACTION_DIRECTIONS,
  TRANSACTION_LOG_TYPES,
} from '../shared/constants/transaction-log-dirction';

interface ErrorObject {
  message: string;
  code?: string;
}

interface AddressData {
  data?: Record<string, unknown>[];
}

@Injectable()
export class AttendeesService {
  private readonly logger = new Logger(AttendeesService.name);
  private readonly clientId: any;
  private readonly baseUrl: any;
  constructor(
    private readonly configService: ConfigService,
    private rmqService: RabbitMQService,
  ) {
    this.baseUrl = this.configService.get<string>('VAULT_BASE_URL');
    this.clientId = this.configService.get<string>('VAULT_CLIENT_ID');
  }

  async listAllattendees(authToken: string): Promise<any> {
    const clientId = this.clientId;
    if (!authToken) {
      throw new HttpException(
        'Missing Authorization header',
        HttpStatus.BAD_REQUEST,
      );
    }
    const config = {
      method: 'get' as const,
      url: `${this.baseUrl}/vobjects/em_attendee__v`,
      headers: {
        Authorization: authToken,
        Accept: 'application/json',
        'X-VaultAPI-ClientID': clientId,
      },
    };
    try {
      const response = await axios.request(config);
      return response.data;
    } catch (error) {
      console.error('Veeva error:', error?.response?.data);
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error:
            error?.response?.data || 'Failed to fetch events from Veeva Vault',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
  async listAttendeeById(authToken: string, id: string): Promise<any> {
    const clientId = this.clientId;
    if (!authToken) {
      throw new HttpException(
        'Missing Authorization header',
        HttpStatus.BAD_REQUEST,
      );
    }
    const config = {
      method: 'get' as const,
      url: `${this.baseUrl}/vobjects/em_attendee__v/${id}`,
      headers: {
        Authorization: authToken,
        Accept: 'application/json',
        'X-VaultAPI-ClientID': clientId,
      },
    };
    try {
      const response = await axios.request(config);
      return response.data;
    } catch (error) {
      console.error('Veeva error:', error?.response?.data);
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error:
            error?.response?.data || 'Failed to fetch events from Veeva Vault',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
  async listAllevents_attendees(authToken: string): Promise<any> {
    const clientId = this.clientId;
    if (!authToken) {
      throw new HttpException(
        'Missing Authorization header',
        HttpStatus.BAD_REQUEST,
      );
    }
    const config = {
      method: 'get' as const,
      url: `${this.baseUrl}/vobjects/event_attendee__v`,
      headers: {
        Authorization: authToken,
        Accept: 'application/json',
        'X-VaultAPI-ClientID': clientId,
      },
    };
    try {
      const response = await axios.request(config);
      return response.data;
    } catch (error) {
      console.error('Veeva error:', error?.response?.data);
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error:
            error?.response?.data || 'Failed to fetch events from Veeva Vault',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
  async listAllEventAttendeeById(authToken, id: string): Promise<any> {
    if (!authToken) {
      throw new HttpException(
        'Missing Authorization header',
        HttpStatus.BAD_REQUEST,
      );
    }
    const config = {
      method: 'get' as const,
      url: `${this.baseUrl}/vobjects/event_attendee__v/${id}`,
      headers: {
        Authorization: authToken,
        Accept: 'application/json',
        'X-VaultAPI-ClientID': this.clientId,
      },
    };
    try {
      const response = await axios.request(config);
      return response.data;
    } catch (error) {
      console.error('Veeva error:', error?.response?.data);
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error:
            error?.response?.data || 'Failed to fetch events from Veeva Vault',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
  async updateAttendee(
    authToken: string,
    AttendeeId: string,
    body: Record<string, string>,
  ): Promise<any> {
    const clientId = this.clientId;
    const config = {
      method: 'put' as const,
      url: `${this.baseUrl}/vobjects/em_attendee__v/${AttendeeId}`,
      data: body,
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
        this.logger.log(`Attendee not updated !`);
      }
      return {
        msg: 'Attendee Updated SUCCESS',
        data: res.data,
      };
    } catch (error) {
      throw new HttpException(
        error.response?.data || 'Failed to fetch Attendee',
        error.response?.status || 500,
        error.message ?? error,
      );
    }
  }

  async queryVault(
    queryVar: string,
    vaultCredentials: {
      sessionId: string;
      clientId: string;
      serverUrl: string;
    },
  ): Promise<any> {
    const query = queryVar;
    const data = qs.stringify({ q: query });

    const config = {
      method: 'post' as const,
      maxBodyLength: Infinity,
      url: `${this.baseUrl}/query`,
      headers: {
        Authorization: vaultCredentials?.sessionId,
        Accept: 'application/json',
        'X-VaultAPI-DescribeQuery': 'true',
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-VaultAPI-ClientID': vaultCredentials?.clientId,
      },
      data: data,
    };

    const response = await axios.request(config);
    return response.data;
  }

  addAttendeeToRMQ(attendee: Record<string, unknown>): Promise<any> {
    return this.rmqService.emit(`vault-attendee-info`, { attendee });
  }

  async getAttendeeListByExternalId(
    vaultCredentials: {
      sessionId: string;
      clientId: string;
      serverUrl: string;
    },
    externalIds: string[],
    transactionLogName: string,
    reqToken,
  ): Promise<any> {
    this.logger.log('the getAttendeeListByExternalId service has started');

    try {
      const { sessionId, clientId, serverUrl } = vaultCredentials;

      if (!sessionId || !clientId || !serverUrl) {
        throw new BadRequestException('Missing Vault auth');
      }

      if (!externalIds?.length) {
        throw new BadRequestException('no externalIds was sent');
      }

      const stringFiledExternalIds = externalIds
        ?.map((id, index) => {
          if (index === 0) {
            return `'${id}'`;
          }
          return `, '${id}'`;
        })
        ?.join('');

      const queryString = `SELECT external_id__v, first_name_cda__v, last_name_cda__v,  name__v, salutation__v, office_phone_cda__v , email_cda__v,  credentials__v, spec_1_cda__v, 
                (SELECT external_id__v, name__v, street_address_2_cda__v, city_cda__v, state_province__v, country__v,   postal_code_cda__v, account__v 
                FROM address__vr)  
              FROM account__v where external_id__v CONTAINS (${stringFiledExternalIds})`;

      const attendeesData = (await this.queryVault(
        queryString,
        vaultCredentials,
      )) as { errors?: [{ message?: string }]; data?: unknown };

      const { errors } = attendeesData;

      if (errors?.length) {
        throw new BadRequestException(errors[0]?.message);
      }

      const attendeeList = (attendeesData?.data || []) as Record<
        string,
        unknown
      >[];

      let result = [] as Record<string, unknown>[];

      result = attendeeList?.map((attendee) => {
        const addressList = attendee?.address__vr as AddressData;

        return {
          ExternalId: attendee?.external_id__v,
          firstName: attendee?.first_name_cda__v,
          LastName: attendee?.last_name_cda__v,
          Name: attendee?.name__v,
          Salutation: attendee?.salutation__v?.[0] || null,
          Phone: attendee?.office_phone_cda__v,
          Email: attendee?.email_cda__v,
          Credential: attendee?.credentials__v?.[0] || null,
          Speciality: attendee?.spec_1_cda__v?.[0] || null,
          addressList: addressList?.data?.map((address, index) => {
            return {
              serialNo: `${index + 1}`,
              AddressLine1: address?.name__v,
              AddressLine2: address?.street_address_2_cda__v,
              City: address?.city_cda__v,
              State: address?.state_province__v?.[0] || null,
              Country: address?.country__v?.[0] || null,
              ZipCode: address?.postal_code_cda__v,
              ExternalID: address?.external_id__v,
            };
          }),
        };
      });

      const promises: any[] = [];

      if (result?.length) {
        for (const attendee of result) {
          const attendeeInfo = this.addAttendeeToRMQ(attendee);
          promises.push(attendeeInfo);
        }
      }

      await Promise.all(promises);

      // await this.createAttendeeListTransactionLog({
      //   transactionLog: {
      //     Name: transactionLogName,
      //     Success: TRANSACTION_SUCCESS_STATUSES.TRUE,
      //     LogType: TRANSACTION_LOG_TYPES.ATTENDEE_INFORMATION,
      //     Owner: `${reqToken?.username || ''}`,
      //     Direction: TRANSACTION_DIRECTIONS.VAULT_OUTBOUND,
      //   },
      // });

      await this.rmqService.send(
        'vault-list-attendees-by-external-ids-transaction-log',
        {
          transactionLog: {
            Name: transactionLogName,
            Success: TRANSACTION_SUCCESS_STATUSES.TRUE,
            LogType: TRANSACTION_LOG_TYPES.ATTENDEE_INFORMATION,
            Owner: `${reqToken?.username || ''}`,
            Direction: TRANSACTION_DIRECTIONS.VAULT_OUTBOUND,
          },
        },
      );

      this.logger.log('the getAttendeeListByExternalId service has ended');

      return { result };
    } catch (err) {
      const error = err as ErrorObject;

      this.logger.error(
        'the getAttendeeListByExternalId service has error',
        error.message,
      );

      await this.rmqService.emit(
        'vault-list-attendees-by-external-ids-transaction-log',
        {
          transactionLog: {
            Name: transactionLogName,
            Success: TRANSACTION_SUCCESS_STATUSES.FALSE,
            LogType: TRANSACTION_LOG_TYPES.ATTENDEE_INFORMATION,
            Owner: `${reqToken?.username || ''}`,
            Direction: TRANSACTION_DIRECTIONS.VAULT_OUTBOUND,
            ErrorMessage: error.message,
          },
        },
      );

      // await this.createAttendeeListTransactionLog({
      //   transactionLog: {
      //     Name: transactionLogName,
      //     Success: TRANSACTION_SUCCESS_STATUSES.FALSE,
      //     LogType: TRANSACTION_LOG_TYPES.ATTENDEE_INFORMATION,
      //     Owner: `${reqToken?.username || ''}`,
      //     Direction: TRANSACTION_DIRECTIONS.VAULT_OUTBOUND,
      //     ErrorMessage: error.message,
      //   },
      // });

      return {
        isError: true,
        message: error.message,
      };
    }
  }

  async createAttendeeListTransactionLog(
    data: Record<string, unknown>,
  ): Promise<Record<string, unknown>> {
    const transaction = (await this.rmqService.send(
      `vault-list-attendees-by-external-ids-transaction-log`,
      { transactionLog: data?.transactionLog },
    )) as Record<string, unknown>;

    return transaction;
  }
}
