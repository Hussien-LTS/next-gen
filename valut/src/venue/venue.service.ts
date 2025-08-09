import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';
import { mapVenueInputToVault } from './venue.mapper';
import { CreateVenueDto } from './DTOs/create_update_venue.dto';
import { RabbitMQService } from 'src/shared/rabbitmq/rabbitmq.service';
import { TRANSACTION_DIRECTIONS } from 'src/shared/constants/transaction-log-dirction';
import { mapTransactionLogPayload } from 'src/shared/transactionLog/mapTransactionLogPayload';

@Injectable()
export class VenueService {
  private transactionId: string;

  constructor(private rmqService: RabbitMQService) {}

  private getHeaders(authorization: string, clientId: string) {
    return {
      Authorization: authorization,
      Accept: '*/*',
      'X-VaultAPI-ClientID': clientId,
    };
  }

  async create(createVenueDto: CreateVenueDto, vaultAuth: any) {
    try {
      const { sessionId, clientId, serverUrl } = vaultAuth;
      if (!sessionId || !clientId || !serverUrl) {
        throw new UnauthorizedException('Missing Vault auth');
      }
      const result = await this.rmqService.send(
        'get_venue_expansion_rule',
        createVenueDto.VenueList,
      );
      console.log('🚀 ~ VenueService ~ result:', result);
      if (result?.response?.error)
        throw new BadRequestException(result?.response?.message);
      const venueBody = mapVenueInputToVault(result);

      const response = await axios.post(
        `${serverUrl}/api/v25.1/vobjects/em_venue__v/?idParam=legacy_crm_id__v`,
        venueBody,
        {
          headers: this.getHeaders(sessionId, clientId),
        },
      );
      if (response?.data?.data[0]?.errors)
        throw new BadRequestException(
          response?.data?.data[0]?.errors[0]?.message,
        );
      else
        await this.rmqService.emit(
          'transaction-log',
          mapTransactionLogPayload({
            name: createVenueDto.TransactionId,
            direction: TRANSACTION_DIRECTIONS.VAULT_OUTBOUND,
            logType: 'Venue',
            success: 'true',
          }),
        );

      console.log('🚀 ~ VenueService ~ response.data:', response?.data);
      return response.data;
    } catch (error: any) {
      console.log('🚀 ~ VenueService ~ error:', error);
      await this.rmqService.emit(
        'transaction-log',
        mapTransactionLogPayload({
          name: this.transactionId,
          direction: TRANSACTION_DIRECTIONS.VAULT_OUTBOUND,
          logType: 'Venue',
          success: 'false',
          errorMessage: error.message,
        }),
      );
      return new BadRequestException(error.message);
    }
  }
}
