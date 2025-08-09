import { Injectable } from '@nestjs/common';

@Injectable()
export class SessionStoreService {
  private sessionId: string | null = null;

  set(sessionId: string): void {
    this.sessionId = sessionId;
  }

  get(): string | null {
    return this.sessionId;
  }
}
