import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class SpeakersService {
  private readonly logger = new Logger(SpeakersService.name);
  private readonly clientId: any;
  private readonly baseUrl: any;
  constructor(private readonly configService: ConfigService) {
    this.baseUrl = this.configService.get<string>('VAULT_BASE_URL');
    this.clientId = this.configService.get<string>('VAULT_CLIENT_ID');
  }
  async listAllSpeakers(authToken: string): Promise<any> {
    const clientId = this.clientId;
    if (!authToken) {
      throw new HttpException(
        'Missing Authorization header',
        HttpStatus.BAD_REQUEST,
      );
    }
    const config = {
      method: 'get' as const,
      url: `${this.baseUrl}/vobjects/em_speaker__v`,
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
            error?.response?.data ||
            'Failed to fetch Speakers from Veeva Vault',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
  async listAllSpeakerById(authToken: string, id: string): Promise<any> {
    const clientId = this.clientId;
    if (!authToken) {
      throw new HttpException(
        'Missing Authorization header',
        HttpStatus.BAD_REQUEST,
      );
    }
    const config = {
      method: 'get' as const,
      url: `${this.baseUrl}/vobjects/em_speaker__v/${id}`,
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
  async listAllSpeakersqualifications(authToken: string): Promise<any> {
    const clientId = this.clientId;
    if (!authToken) {
      throw new HttpException(
        'Missing Authorization header',
        HttpStatus.BAD_REQUEST,
      );
    }
    const config = {
      method: 'get' as const,
      url: `${this.baseUrl}/vobjects/em_speaker_qualification__v`,
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
  async listAllSpeakerQualificationsById(
    authToken: string,
    id: string,
  ): Promise<any> {
    const clientId = this.clientId;
    if (!authToken) {
      throw new HttpException(
        'Missing Authorization header',
        HttpStatus.BAD_REQUEST,
      );
    }
    const config = {
      method: 'get' as const,
      url: `${this.baseUrl}/vobjects/em_speaker_qualification__v/${id}`,
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

  async listAllEventsSpeakers(authToken: string): Promise<any> {
    const clientId = this.clientId;
    if (!authToken) {
      throw new HttpException(
        'Missing Authorization header',
        HttpStatus.BAD_REQUEST,
      );
    }
    const config = {
      method: 'get' as const,
      url: `${this.baseUrl}/vobjects/em_event_speaker__v`,
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
  async listEventSpeakerById(authToken: string, id: string): Promise<any> {
    const clientId = this.clientId;
    if (!authToken) {
      throw new HttpException(
        'Missing Authorization header',
        HttpStatus.BAD_REQUEST,
      );
    }
    const config = {
      method: 'get' as const,
      url: `${this.baseUrl}/vobjects/em_event_speaker__v/${id}`,
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

  async updateSpeaker(
    authToken: string,
    speakerId: string,
    body: Record<string, string>,
  ): Promise<any> {
    const clientId = this.clientId;
    const config = {
      method: 'put' as const,
      url: `${this.baseUrl}/vobjects/em_speaker__v/${speakerId}`,
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
        this.logger.log(`Speaker not updated !`);
      }
      return {
        msg: 'Speaker Updated SUCCESS',
        data: res.data,
      };
    } catch (error) {
      throw new HttpException(
        error.response?.data || 'Failed to fetch Speaker',
        error.response?.status || 500,
        error.message ?? error,
      );
    }
  }
}
