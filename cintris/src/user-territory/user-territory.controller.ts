/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import {
  Controller,
  BadRequestException,
  Post,
  Body,
  UseGuards,
} from "@nestjs/common";
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiBadRequestResponse,
  ApiBody,
  ApiHeader,
} from "@nestjs/swagger";
import { UserTerritoryService } from "./user-territory.service";
import { CreateSalesforceUserTerritoryDto } from "./DTOs/create-salesforce-transaction.dto";
import { Ctx, EventPattern, Payload, RmqContext } from "@nestjs/microservices";
import { JwtAuthGuard } from "src/libs/shared-auth/jwt-auth.guard";

@ApiTags("User Territory")
@Controller("user-territory")
export class UserTerritoryController {
  private access_token: string | null = null;
  private token: Record<string, unknown> | null = null;
  constructor(private readonly userTerritoryService: UserTerritoryService) {}

  @EventPattern("salesforce_auth_response")
  handleAuthResponse(
    @Payload() data: Record<string, unknown>,
    @Ctx() context: RmqContext
  ) {
    console.log("Auth from RMQ", data);

    const access_token = data?.access_token;
    this.access_token = access_token as string;
    this.token = data;

    if (!access_token) {
      context.getChannelRef().nack(context.getMessage(), false, false);
      throw new Error("access_token missing in payload");
    }
    return {
      status: "access_token received from RMQ",
      access_token,
    };
  }

  @Post("/transaction")
  @UseGuards(JwtAuthGuard)
  @ApiHeader({
    name: "auth",
    description: "Token JWT",
    required: true,
  })
  @ApiBody({
    type: CreateSalesforceUserTerritoryDto,
    description: "User Territory Inbound Transaction",
    required: true,
  })
  @ApiOperation({
    summary: "Create Salesforce User Territory Outbound Transaction",
  })
  @ApiResponse({
    status: 200,
    description: "Salesforce User Territory Outbound Transaction",
    example: {
      success: true,
      message: "User Territory data sync successfully in Salesforce",
    },
  })
  @ApiBadRequestResponse({
    description: "Bad Request Errors",
    examples: {
      tokenError: {
        summary: "Authorization Error",
        value: {
          message: "Invalid or expired Access Token.",
          error: "Bad Request",
          statusCode: 400,
        },
      },
      transactionIdError: {
        summary: "Entering Transaction Inbound Id That does not exist",
        value: {
          message: "invalid inbound transaction id",
          error: "Bad Request",
          statusCode: 400,
        },
      },
    },
  })
  async createUserTerritoryTransaction(
    @Body() payload: CreateSalesforceUserTerritoryDto
  ) {
    const authToken = this.token;

    if (!authToken) {
      throw new BadRequestException("Invalid or expired Access Token.");
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return await this.userTerritoryService.createUserTerritoryTransaction(
      authToken,
      payload
    );
  }
}
