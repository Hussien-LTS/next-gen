import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from "@nestjs/common";
import { Observable, from } from "rxjs";
import { switchMap } from "rxjs/operators";
import { RabbitMQService } from "src/shared/rabbitmq/rabbitmq.service";

@Injectable()
export class CentrisAuthInterceptor implements NestInterceptor {
  constructor(private readonly rmqService: RabbitMQService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();

    return from(
      this.rmqService.send("get_centris_auth", { authKey: "centrisAuth" })
    ).pipe(
      switchMap((centrisResponse) => {
        request.centrisAuth = centrisResponse;
        return next.handle();
      })
    );
  }
}
