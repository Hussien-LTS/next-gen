import {
  Inject,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, timeout, catchError, retry } from 'rxjs';
import { RABBITMQ_CLIENT } from '../constants/rabbitmq.constants';

@Injectable()
export class RabbitMQService {
  constructor(@Inject(RABBITMQ_CLIENT) private readonly client: ClientProxy) {}

  emit(pattern: string, data: any): Promise<any> {
    return firstValueFrom(this.client.emit(pattern, data));
  }

  async send(
    pattern: string,
    data: any,
    timeoutMs = 4000,
    retryCount = 2,
  ): Promise<any> {
    return firstValueFrom(
      this.client.send(pattern, data).pipe(
        timeout(timeoutMs),
        retry(retryCount),
        catchError((err) => {
          console.error(`[RabbitMQService] Pattern "${pattern}" failed:`, {
            message: err.message,
            stack: err.stack,
            context: err.response?.data || null,
          });
          throw new ServiceUnavailableException(
            `Service "${pattern}" unavailable: ${err.message}`,
          );
        }),
      ),
    );
  }

  getClient(): ClientProxy {
    return this.client;
  }
}
