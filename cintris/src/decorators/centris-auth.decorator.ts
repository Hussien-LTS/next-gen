import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export const CustomCentrisAuth = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.centrisAuth;
  }
);
