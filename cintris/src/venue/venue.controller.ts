import {
  Controller,
  Post,
  Body,
  UsePipes,
  ValidationPipe,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { VenueService } from "./venue.service";
import { ApiTags, ApiBody, ApiHeader } from "@nestjs/swagger";
import { CreateVenueTransactionDto } from "./DTOs/create-salesforce-venue.dto";
import { JwtAuthGuard } from "src/libs/shared-auth/jwt-auth.guard";
import { TransformInterceptor } from "src/shared/interceptors/transform.interceptor";

@ApiTags("Venue")
@Controller("salesforce/venue")
@UseGuards(JwtAuthGuard)
export class VenueController {
  constructor(private readonly venueService: VenueService) {}

  @Post()
  @UseInterceptors(TransformInterceptor)
  @ApiHeader({
    name: "auth",
    description: "Token JWT",
    required: true,
  })
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  @ApiBody({ type: CreateVenueTransactionDto })
  create(@Body() salesforceVenue: CreateVenueTransactionDto) {
    return this.venueService.create(salesforceVenue);
  }
}
