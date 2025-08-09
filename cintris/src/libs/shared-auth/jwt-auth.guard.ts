import { Injectable, CanActivate, ExecutionContext } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const token = this.extractToken(request);

    if (!token) {
      return false;
    }

    try {
      const payload = this.jwtService.verify(token);
      request.user = payload;
      return true;
    } catch {
      return false;
    }
  }

  private extractToken(request): string | null {
       const authHeader = request.headers.auth;
    if (!authHeader) return null;
    if (authHeader.startsWith('Bearer ')) {
      return authHeader.split(' ')[1];
    }
    return authHeader;
  }
}
