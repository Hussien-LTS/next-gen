import { BadRequestException, Controller } from '@nestjs/common';
import { UsersService } from './users.service';
import { EventPattern, Payload } from '@nestjs/microservices';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @EventPattern('vault-user-created')
  async createTerritory(@Payload() data: any) {
    if (!data) {
      throw new BadRequestException('Body is required');
    }
    await this.usersService.createUser(data);
  }
}
