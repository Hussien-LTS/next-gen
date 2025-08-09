import { Body, Controller, Get, Header, Headers, HttpException, HttpStatus, Param, Post } from '@nestjs/common';
import { VaultService } from './services/vault.service';
import { ApiTags, ApiBearerAuth, ApiHeader, ApiOperation, ApiParam, ApiResponse, ApiBody, ApiProperty } from '@nestjs/swagger';
import axios from 'axios';
import { AttachmentDto } from './models/attachment_dto.model';


class DownloadRequestDto {

  @ApiProperty({ description: 'Vault API authorization token' })
  objectId: string;

  @ApiProperty({ description: 'Vault API authorization token' })
  attachmentId: string;

  @ApiProperty({ description: 'Vault API authorization token' })
  version: string;
}




class CreateVaultTransactionAttachmentDto {
  @ApiProperty({ example: 'TOKEN' })
  auth: string;

  // @ApiProperty({ example: '21121544878' })
  // clientID: string;

  @ApiProperty({ example: 'VIRZ08LKW9549TF' })
  transactionID: string;


}
@Controller('vvattendee')
@ApiTags('VeevaVault Attendee APis')

export class VaultAttendeeController {


  constructor(private readonly vaultService: VaultService) { }


  @Get('attendees')
  @ApiBearerAuth('vault-auth')
  @ApiOperation({ summary: 'List All attendees from Veeva Vault' })
  @ApiHeader({
    name: 'auth',
    description: 'Vault Session ID (use /auth endpoint to get it)',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'List of all attendees from Veeva Vault',
  })
  @ApiResponse({ status: 400, description: 'Missing or invalid token' })
  async listAllattendees(@Headers() headers: Record<string, string>): Promise<any> {
    const authToken = headers['auth'];
    console.log('AUTHHHHH', authToken);

    if (!authToken) {
      throw new HttpException('Missing Authorization header', HttpStatus.BAD_REQUEST);
    }

    const url = `https://sb-novo-migrator-na-2025-01-27v2.veevavault.com/api/v20.3/vobjects/em_attendee__v/`;

    try {
      const response = await axios.get(url, {
        headers: {
          Authorization: authToken,
          Accept: 'application/json',
          'X-VaultAPI-ClientID': 'your-client-id', // optional
        },
      });

      return response.data;
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


  @Get('attendee/:id')
  @ApiBearerAuth('vault-auth')
  @ApiOperation({ summary: 'List All attendee from Veeva Vault' })
  @ApiHeader({
    name: 'auth',
    description: 'Vault Session ID (use /auth endpoint to get it)',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'retreive an attendee by id from Veeva Vault',
  })
  @ApiResponse({ status: 400, description: 'Missing or invalid token' })
  async listAttendeeById(@Headers() headers: Record<string, string>, @Param('id') id: string,): Promise<any> {
    const authToken = headers['auth']; // must use lowercase
    console.log('AUTHHHHH', authToken);

    if (!authToken) {
      throw new HttpException('Missing Authorization header', HttpStatus.BAD_REQUEST);
    }

    const url = `https://sb-novo-migrator-na-2025-01-27v2.veevavault.com/api/v20.3/vobjects/em_attendee__v/${id}`;

    try {
      const response = await axios.get(url, {
        headers: {
          Authorization: authToken,
          Accept: 'application/json',
          'X-VaultAPI-ClientID': 'your-client-id', // optional
        },
      });

      return response.data;
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



  

  @Get('events_attendees')
  @ApiBearerAuth('vault-auth')
  @ApiOperation({ summary: 'List All events_attendees from Veeva Vault' })
  @ApiHeader({
    name: 'auth',
    description: 'Vault Session ID (use /auth endpoint to get it)',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'List of all events_attendees from Veeva Vault',
  })
  @ApiResponse({ status: 400, description: 'Missing or invalid token' })
  async listAllevents_attendees(@Headers() headers: Record<string, string>): Promise<any> {
    const authToken = headers['auth'];
    console.log('AUTHHHHH', authToken);

    if (!authToken) {
      throw new HttpException('Missing Authorization header', HttpStatus.BAD_REQUEST);
    }

    const url = `https://sb-novo-migrator-na-2025-01-27v2.veevavault.com/api/v20.3/vobjects/event_attendee__v/`;

    try {
      const response = await axios.get(url, {
        headers: {
          Authorization: authToken,
          Accept: 'application/json',
          'X-VaultAPI-ClientID': 'your-client-id', // optional
        },
      });

      return response.data;
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


  @Get('event_attendee/:id')
  @ApiBearerAuth('vault-auth')
  @ApiOperation({ summary: 'List All attendee from Veeva Vault' })
  @ApiHeader({
    name: 'auth',
    description: 'Vault Session ID (use /auth endpoint to get it)',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'retreive an attendee by id from Veeva Vault',
  })
  @ApiResponse({ status: 400, description: 'Missing or invalid token' })
  async listAllEventAttendeeById(@Headers() headers: Record<string, string>, @Param('id') id: string,): Promise<any> {
    const authToken = headers['auth']; // must use lowercase
    console.log('AUTHHHHH', authToken);

    if (!authToken) {
      throw new HttpException('Missing Authorization header', HttpStatus.BAD_REQUEST);
    }

    const url = `https://sb-novo-migrator-na-2025-01-27v2.veevavault.com/api/v20.3/vobjects/event_attendee__v/${id}`;

    try {
      const response = await axios.get(url, {
        headers: {
          Authorization: authToken,
          Accept: 'application/json',
          'X-VaultAPI-ClientID': 'your-client-id', // optional
        },
      });

      return response.data;
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


 
}