import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);
  constructor(private readonly configService: ConfigService) {}
  async validateTokenWithAuthApp(jwt: string): Promise<any> {
    const citrisAuthAppUrl: any =
      this.configService.get<string>('citrisAuthAppUrl');
    try {
      const response = await axios.post(
        citrisAuthAppUrl,
        {},
        {
          headers: {
            'auth-citris': jwt,
          },
        },
      );
      return response.data;
    } catch (error) {
      return {
        valid: false,
        message: 'Error contacting auth service',
        error: error.response?.data || error.message,
      };
    }
  }
}
