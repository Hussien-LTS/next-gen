import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getVault(): string {
    return '!\TEst';
  }
}
