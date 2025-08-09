import {
  Controller,
  Body,
  ForbiddenException,
  Post,
  UnauthorizedException,
  UseInterceptors,
} from '@nestjs/common';
import { VenueService } from './venue.service';
import { ApiTags, ApiSecurity, ApiBody } from '@nestjs/swagger';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import { CreateVenueDto } from './DTOs/create_update_venue.dto';
import { VaultAuthInterceptor } from 'src/interceptors/vault-auth.interceptor';
import { CustomVaultAuth } from 'src/decorators/vault-auth.decorator';

@ApiTags('Venue')
@ApiSecurity('sessionId')
@Controller('vault/v1/venue')
export class VenueController {
  constructor(private readonly venueService: VenueService) {}

  @Post()
  @UseInterceptors(VaultAuthInterceptor)
  @ApiBody({ type: CreateVenueDto })
  create(
    @Body() createVenueDto: CreateVenueDto,
    @Ctx() context: RmqContext,
    @CustomVaultAuth() vaultData: any,
  ) {
    console.log(
      '🚀 ~ VenueController ~ create ~ createVenueDto:',
      createVenueDto,
    );

    return this.venueService.create(createVenueDto, vaultData);
  }

  @EventPattern('vault_venue')
  @UseInterceptors(VaultAuthInterceptor)
  createVenueRMQ(
    @Payload() createVenueDto: CreateVenueDto,
    @Ctx() context: RmqContext,
    @CustomVaultAuth() vaultData: any,
  ) {
    return this.venueService.create(createVenueDto, vaultData);
  }
}
