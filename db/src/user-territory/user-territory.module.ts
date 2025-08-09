import { Module } from '@nestjs/common';
import { UserTerritoryController } from './user-territory.controller';
import { UserTerritoryService } from './user-territory.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionLog } from 'src/entities/transaction_log.entity';
import { UserTerritory } from 'src/entities/userterritory .entity';
import { User } from 'src/entities/user.entity';
import { Territory } from 'src/entities/territory.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([TransactionLog, UserTerritory, User, Territory]),
  ],
  controllers: [UserTerritoryController],
  providers: [UserTerritoryService],
})
export class UserTerritoryModule {}
