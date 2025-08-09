import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthConfig } from 'src/entities/auth-config';
import { AuthConfigDto } from './DTOs/auth-config.dto';
import { CryptoService } from 'src/crypto/crypto.service';

type ConfigPayload = Record<string, string>;

@Injectable()
export class AuthConfigService {
  @InjectRepository(AuthConfig)
  private authConfigRepository: Repository<AuthConfig>;

  constructor(private readonly cryptoService: CryptoService) {}
  async getByAuthKey(authKey: string) {
    try {
      const config = await this.authConfigRepository.findOne({
        where: { authKey },
      });
      if (!config) {
        throw new NotFoundException(`No config found for authKey: ${authKey}`);
      }

      const parsed: ConfigPayload = JSON.parse(config.authValue);
      ['password', 'client_secret'].forEach((field) => {
        if (parsed[field]) {
          parsed[field] = this.cryptoService.decrypt(parsed[field]);
        }
      });

      return parsed;
    } catch (error) {
      console.log('🚀 ~ AuthConfigService ~ getByAuthKey ~ error:', error);
      return new BadRequestException('Failed to fetch config by authKey');
    }
  }

  async patchByAuthKey(newConfig: AuthConfigDto) {
    try {
      const authKey = newConfig.authKey;
      const originalAuthValue = newConfig.authValue;

      const encryptedAuthValue = { ...originalAuthValue };

      ['password', 'client_secret'].forEach((field) => {
        if (encryptedAuthValue[field]) {
          encryptedAuthValue[field] = this.cryptoService.encrypt(
            encryptedAuthValue[field],
          );
        }
      });

      const payload = {
        authKey,
        authValue: JSON.stringify(encryptedAuthValue),
      };

      const existingConfig = await this.authConfigRepository.findOne({
        where: { authKey },
      });

      if (existingConfig) {
        existingConfig.authValue = payload.authValue;
        return await this.authConfigRepository.save(existingConfig);
      } else {
        return await this.authConfigRepository.save(payload);
      }
    } catch (error) {
      console.log("🚀 ~ AuthConfigService ~ patchByAuthKey ~ error:", error)
      return new BadRequestException('Failed to update config');
    }
  }
}
