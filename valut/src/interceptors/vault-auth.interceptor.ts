import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, from } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { RabbitMQService } from 'src/shared/rabbitmq/rabbitmq.service';

@Injectable()
export class VaultAuthInterceptor implements NestInterceptor {
  constructor(private readonly rmqService: RabbitMQService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();

    return from(
      this.rmqService.send('get_vault_auth', { authKey: 'vaultAuth' }),
    ).pipe(
      switchMap((vaultResponse) => {
        request.vaultAuth = vaultResponse; 
        return next.handle();
      }),
    );
  }
}
