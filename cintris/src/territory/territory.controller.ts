import {
  Body,
  Controller,
  Post,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from "@nestjs/common";
import { TerritoryService } from "./territory.service";
import { ApiBody, ApiResponse } from "@nestjs/swagger";
import { ManageTerritoryDTO } from "./DTOs/manage-territory.dto";
import { CentrisAuthInterceptor } from "src/interceptors/centris-auth.interceptor";
import { CustomCentrisAuth } from "src/decorators/centris-auth.decorator";

@Controller("centris")
export class TerritoryController {
  constructor(private readonly territoryService: TerritoryService) {}

  @Post("territory")
  @UseInterceptors(CentrisAuthInterceptor)
  @UsePipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  )
  @ApiBody({ type: ManageTerritoryDTO })
  @ApiResponse({
    status: 201,
    description: "Territory successfully created and response returned.",
  })
  async createTerritory(
    @Body() data: ManageTerritoryDTO,
    @CustomCentrisAuth() authData: any
  ) {
    console.log(
      "🚀 ~ TerritoryController ~ createTerritory ~ authData:",
      authData
    );

    const response = await this.territoryService.manageTerritory(
      authData,
      data
    );
    return response;
  }
}
