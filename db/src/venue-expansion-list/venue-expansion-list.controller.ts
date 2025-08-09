import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { VenueExpansionListService } from './venue-expansion-list.service';

@Controller('venue-expansion-list')
export class VenueExpansionListController {
  constructor(
    private readonly venueExpansionListService: VenueExpansionListService,
  ) {}

  @EventPattern('get_venue_expansion_rule')
  async handleGetVenueExpansionRule(@Payload() data: any) {
    console.log('📨 Received get_venue_expansion_rule message:', data);

    return this.venueExpansionListService.getExpansionList(data);
  }
}
