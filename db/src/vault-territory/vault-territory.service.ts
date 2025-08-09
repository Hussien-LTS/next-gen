import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Territory } from '../entities/territory.entity';
import { mapApiResponseToTerritory } from './vault-territory.mapper';
import { TransactionLogService } from '../transaction-log/transaction-log.service';

@Injectable()
export class VaultTerritoryService {
  constructor(
    @InjectRepository(Territory)
    private readonly territoryRepository: Repository<Territory>,
    private readonly transactionLogService: TransactionLogService,
  ) {}

  async createVaultTerritory(territoryData: any): Promise<void> {
    console.log(
      '🚀 ~ VaultTerritoryService ~ createVaultTerritory ~ territoryData:',
      territoryData,
    );
    try {
      const mappedTerritory = mapApiResponseToTerritory(territoryData);

      console.log('[VaultTerritoryService] Mapped Territory:', mappedTerritory);

      const existingTerritory = await this.territoryRepository.findOneBy({
        Id: mappedTerritory.Id,
      });

      if (existingTerritory) {
        if (mappedTerritory.ExternalId) {
          await this.territoryRepository.update(
            { Id: mappedTerritory.Id },
            mappedTerritory,
          );
        }
      } else {
        const newTerritory =
          await this.territoryRepository.insert(mappedTerritory);
        console.log(
          '🚀 ~ VaultTerritoryService ~ createVaultTerritory ~ newTerritory:',
          newTerritory,
        );
      }
    } catch (error) {
      console.log(
        '🚀 ~ VaultTerritoryService ~ createVaultTerritory ~ error:',
        error,
      );
      throw new Error('Failed to save territory information.');
    }
  }
}
