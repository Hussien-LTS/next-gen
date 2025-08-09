import { Body, Controller, Get, Header, Headers, HttpException, HttpStatus, Param, Post } from '@nestjs/common';
import { VaultService } from './services/vault.service';
import { ApiTags, ApiBearerAuth, ApiHeader, ApiOperation, ApiParam, ApiResponse, ApiBody, ApiProperty } from '@nestjs/swagger';
import axios from 'axios';
import { AttachmentDto } from './models/attachment_dto.model';
import { EventByIdVO } from './vos/event_response.vo';
import * as qs from 'qs';


export class SparkMessageDto {
  @ApiProperty({ description: 'Type of event, e.g., CREATE, UPDATE, DELETE' })
  event_type: string;

  @ApiProperty({ description: 'Name of the Vault object affected by the event' })
  object: string;

  @ApiProperty({ description: 'Unique Vault record ID of the affected object' })
  record_id: string;

  @ApiProperty({ description: 'Timestamp of the event in ISO format' })
  timestamp: string;

  @ApiProperty({ description: 'User who triggered the event' })
  user: string;

  @ApiProperty({ description: 'Object data at the time of the event' })
  data: Record<string, any>;
}

export class EventIdDto {
  @ApiProperty()
  eventId: string;
}

class DownloadRequestDto {

  @ApiProperty({ description: 'Vault API authorization token' })
  transactionID: string;

  @ApiProperty({ description: 'Vault API authorization token' })
  attachmentId: string;

  @ApiProperty({ description: 'Vault API authorization token' })
  version: string;
}

export class QueryVeevaDto {
  @ApiProperty({ example: "V7RZ025E825Z5M0" })
  eventId: string;

  // @ApiProperty({ example: "em_event__v" })
  // objectName: string;


}

class UpdateEventDto {

  @ApiProperty({ description: 'fieldName' })
  fieldName: string;

  @ApiProperty({ description: 'value' })
  value: string;

}




class CreateVaultTransactionAttachmentDto {
  @ApiProperty({ example: 'TOKEN' })
  auth: string;

  // @ApiProperty({ example: '21121544878' })
  // clientID: string;

  @ApiProperty({ example: 'VIRZ08LKW9549TF' })
  transactionID: string;


}
@Controller('vvevent')
@ApiTags('VeevaVault Event APis')

export class VaultEventController {


  constructor(private readonly vaultService: VaultService) { }


  @Get('events')
  @ApiBearerAuth('vault-auth')
  @ApiOperation({ summary: 'List All events from Veeva Vault' })
  @ApiHeader({
    name: 'auth',
    description: 'Vault Session ID (use /auth endpoint to get it)',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'List of all events from Veeva Vault',
  })
  @ApiResponse({ status: 400, description: 'Missing or invalid token' })
  async listAllEvents(@Headers() headers: Record<string, string>): Promise<any> {
    const authToken = headers['auth'];
    console.log('AUTHHHHH', authToken);

    if (!authToken) {
      throw new HttpException('Missing Authorization header', HttpStatus.BAD_REQUEST);
    }

    const url = `https://sb-novo-migrator-na-2025-01-27v2.veevavault.com/api/v20.3/vobjects/em_event__v/`;

    try {
      const response = await axios.get(url, {
        headers: {
          Authorization: authToken,
          Accept: 'application/json',
          'X-VaultAPI-ClientID': 'your-client-id', // optional
        },
      });

      return response.data.data as EventByIdVO;
    } catch (error) {
      console.error('Veeva error:', error?.response?.data);
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: error?.response?.data || 'Failed to fetch events from Veeva Vault',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }


  @Get('event/:id')
  @ApiBearerAuth('vault-auth')
  @ApiOperation({ summary: 'List All events from Veeva Vault' })
  @ApiHeader({
    name: 'auth',
    description: 'Vault Session ID (use /auth endpoint to get it)',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'retreive an event by id from Veeva Vault',
  })
  @ApiResponse({ status: 400, description: 'Missing or invalid token' })
  async listAllEventsById(@Headers() headers: Record<string, string>, @Param('id') id: string,): Promise<any> {
    const authToken = headers['auth']; // must use lowercase
    console.log('AUTHHHHH', authToken);

    if (!authToken) {
      throw new HttpException('Missing Authorization header', HttpStatus.BAD_REQUEST);
    }

    const url = `https://sb-novo-migrator-na-2025-01-27v2.veevavault.com/api/v20.3/vobjects/em_event__v/${id}`;

    try {
      return this.vaultService.eventById(id, authToken);
    } catch (error) {
      console.error('Veeva error:', error?.response?.data);
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: error?.response?.data || 'Failed to fetch events from Veeva Vault',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }




  @Post('transactions_logs')
  @ApiOperation({ summary: 'read transaction attachment content from Veeva Vault' })
  @ApiBody({
    type: DownloadRequestDto,
    description: 'Provide authentication and attachment identifiers',
  })
  @ApiHeader({
    name: 'auth',
    description: 'Vault Session ID (use /auth endpoint to get it)',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Attachment file content (as text or base64)',
    schema: {
      type: 'object',
      properties: {
        content: { type: 'string', description: 'File content (base64 encoded or text)' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad Request or Veeva API Error' })
  async transactionAttachment(@Headers() headers: Record<string, string>, @Body() body: DownloadRequestDto): Promise<any> {
    const { transactionID, attachmentId, version } = body;
    const authToken = headers['auth'];
    const url = `https://sb-novo-migrator-na-2025-01-27v2.veevavault.com/api/v20.3/vobjects/transaction_logs__c/${transactionID}/attachments/${attachmentId}/versions/${version}/file`;

    try {
      const response = await axios.get(url, {
        headers: {
          'Authorization': authToken,
          'Accept': 'application/json',
          'X-VaultAPI-ClientID': '3MVG9dG9pUXcsrJANLhayvGIEIgf3Kq5FUDwaSx.rHj.Ji2D2.F7ouMmJTTJk8H5qxLM_uQsopuv6J5nnzADm',
        },
      });

      const base64Content = response.data;

      this.vaultService.receiveEventTransactionAttachmentAndPublishTOMQ(base64Content);
      return base64Content;
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: error?.response?.data || 'Failed to download file from Veeva Vault',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('event/team-members')
  @ApiBody({ type: QueryVeevaDto })
  @ApiHeader({
    name: 'auth',
    description: 'Vault Session ID (use /auth endpoint to get it)',
    required: true,
  })
  async teamMembers(@Headers() headers: Record<string, string>, @Body() dto: QueryVeevaDto) {
    const authToken = headers['auth'];

    return this.vaultService.eventQyeryObject(dto.eventId, authToken, "em_event_team_member__v", "name__v");
  }


  @Post('event/expense-estimate')
  @ApiBody({ type: QueryVeevaDto })
  @ApiHeader({
    name: 'auth',
    description: 'Vault Session ID (use /auth endpoint to get it)',
    required: true,
  })
  async expenceEstimate(@Headers() headers: Record<string, string>, @Body() dto: QueryVeevaDto) {
    const authToken = headers['auth'];

    return this.vaultService.eventQyeryObject(dto.eventId, authToken, "em_expense_estimate__v", "name__v");
  }

  @Post('event/attendees')
  @ApiBody({ type: QueryVeevaDto })
  @ApiHeader({
    name: 'auth',
    description: 'Vault Session ID (use /auth endpoint to get it)',
    required: true,
  })
  async attendee(@Headers() headers: Record<string, string>, @Body() dto: QueryVeevaDto) {
    const authToken = headers['auth'];

    return this.vaultService.eventQyeryObject(dto.eventId, authToken, "em_attendee__v", "attendee_name__v");
  }


  @Post('event/venue')
  @ApiBody({ type: QueryVeevaDto })
  @ApiHeader({
    name: 'auth',
    description: 'Vault Session ID (use /auth endpoint to get it)',
    required: true,
  })
  async venue(@Headers() headers: Record<string, string>, @Body() dto: QueryVeevaDto) {
    const authToken = headers['auth'];

    return this.vaultService.eventQyeryObject(dto.eventId, authToken, "em_venue__v", "venue_name__v");
  }


  @Post('event/speaker')
  @ApiBody({ type: QueryVeevaDto })
  @ApiHeader({
    name: 'auth',
    description: 'Vault Session ID (use /auth endpoint to get it)',
    required: true,
  })
  async speaker(@Headers() headers: Record<string, string>, @Body() dto: QueryVeevaDto) {
    const authToken = headers['auth'];

    return this.vaultService.eventQyeryObject(dto.eventId, authToken, "em_event_speaker__v", "name__v , speaker_name__v");
  }

  @Post('event/budget')
  @ApiBody({ type: QueryVeevaDto })
  @ApiHeader({
    name: 'auth',
    description: 'Vault Session ID (use /auth endpoint to get it)',
    required: true,
  })
  async budget(@Headers() headers: Record<string, string>, @Body() dto: QueryVeevaDto) {
    const authToken = headers['auth'];

    return this.vaultService.eventQyeryObject(dto.eventId, authToken, "em_event_budget__v", "budget_name__v");
  }

  @Get('transactionattach/:id')
  @ApiOperation({ summary: 'Event Trasnaction Attachments' })
  @ApiHeader({
    name: 'auth',
    description: 'Vault Session ID (use /auth endpoint to get it)',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Object created successfully',
    schema: { type: 'object', additionalProperties: true },
  })
  @ApiResponse({ status: 400, description: 'Bad request or Veeva API failure' })
  async getAttachments(@Headers('auth') authToken: string, @Param('id') id: string): Promise<AttachmentDto[]> {

    return this.vaultService.getAttachments(authToken, id);
  }


  @Post('event/:id')
  @ApiBody({
    type: UpdateEventDto,
    description: 'Provide authentication and attachment identifiers',
  })
  async updateEventField(
    @Headers('auth') authToken: string,
    @Param('id') eventId: string,
    @Body() requestBody: UpdateEventDto,
  ): Promise<any> {


    const res = this.vaultService.updateEvent(eventId, authToken, requestBody).then((result) => {
      console.log('Event Update Process :', result);
      return res;

    })
      .catch((error) => {
        console.error('Update failed:', error.message);
      });;
    console.log("Event Update Process : ", res);
  }

  toRecordString(obj: any): Record<string, string> {
    const record: Record<string, string> = {};

    for (const [key, value] of Object.entries(obj)) {
      record[key] = value !== null && value !== undefined ? String(value) : '';
    }

    return record;
  }


  @Post('event-structured')
  @ApiHeader({
    name: 'auth',
    description: 'Vault Session ID (use /auth endpoint to get it)',
    required: true,
  })
  async getStructuredEvent(@Headers('auth') authToken: string, @Body() dto: EventIdDto) {
    return this.vaultService.getStructuredEventPayload(dto.eventId, authToken);
  }


  @Post('/notifications/vault/spark')
  @ApiBody({ type: SparkMessageDto })
  @ApiHeader({
    name: 'auth',
    description: 'Vault Session ID (use /auth endpoint to get it)',
    required: true,
  })
   
  handleSparkMessage(@Headers('auth') authToken: string, @Body() message: SparkMessageDto) {

    console.log("handleSparkMessage : ",message);
    return this.vaultService.handleSparkMessage(message, authToken);

  }

}