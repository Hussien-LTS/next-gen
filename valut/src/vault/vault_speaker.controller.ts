
import { Body, Controller, Get, Header, Headers, HttpException, HttpStatus, Param, Post } from '@nestjs/common';
import { VaultService } from './services/vault.service';
import { ApiTags, ApiBearerAuth, ApiHeader, ApiOperation, ApiParam, ApiResponse, ApiBody, ApiProperty } from '@nestjs/swagger';
import { VaultAuthDto } from './models/vaultauth.model';
import { Response } from 'express';
import axios from 'axios';
import { AttachmentDto } from './models/attachment_dto.model';


class CreateVaultObjectDto {
    @ApiProperty({ example: 'TOKEN' })
    auth: string;

    @ApiProperty({ example: 'em_speaker__v' })
    objectType: string;


}

@Controller('vvspeaker')
@ApiTags('VeevaVault Speaker APis')
export class VaultSpeakerController {

    
 

    
  @Get('event_speaker')
  @ApiBearerAuth('vault-auth')
  @ApiOperation({ summary: 'List All speakers events from Veeva Vault' })
  @ApiHeader({
    name: 'auth',
    description: 'Vault Session ID (use /auth endpoint to get it)',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'List All speakers events from Veeva Vault',
  })
  @ApiResponse({ status: 400, description: 'Missing or invalid token' })
  async listAllEventsSpeakers(@Headers() headers: Record<string, string>): Promise<any> {
    const authToken = headers['auth'];
    console.log('AUTHHHHH', authToken);

    if (!authToken) {
      throw new HttpException('Missing Authorization header', HttpStatus.BAD_REQUEST);
    }

    const url = `https://sb-novo-migrator-na-2025-01-27v2.veevavault.com/api/v25.1/vobjects/em_event_speaker__v/`;

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


  @Get('event_speaker/:id')
  @ApiBearerAuth('vault-auth')
  @ApiOperation({ summary: 'retreieve speaker event by id from Veeva Vault' })
  @ApiHeader({
    name: 'auth',
    description: 'Vault Session ID (use /auth endpoint to get it)',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'retreieve speaker event by id from Veeva Vault',
  })
  @ApiResponse({ status: 400, description: 'Missing or invalid token' })
  async listAllEventSpeakerById(@Headers() headers: Record<string, string>, @Param('id') id: string,): Promise<any> {
    const authToken = headers['auth']; // must use lowercase
    console.log('AUTHHHHH', authToken);

    if (!authToken) {
      throw new HttpException('Missing Authorization header', HttpStatus.BAD_REQUEST);
    }

    const url = `https://sb-novo-migrator-na-2025-01-27v2.veevavault.com/api/v25.1/vobjects/em_event_speaker__v/${id}`;

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




  
    
  @Get('speakers')
  @ApiBearerAuth('vault-auth')
  @ApiOperation({ summary: 'List All speakers   from Veeva Vault' })
  @ApiHeader({
    name: 'auth',
    description: 'Vault Session ID (use /auth endpoint to get it)',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'List All speakers   from Veeva Vault',
  })
  @ApiResponse({ status: 400, description: 'Missing or invalid token' })
  async listAllSpeakers(@Headers() headers: Record<string, string>): Promise<any> {
    const authToken = headers['auth'];
    console.log('AUTHHHHH', authToken);

    if (!authToken) {
      throw new HttpException('Missing Authorization header', HttpStatus.BAD_REQUEST);
    }

    const url = `https://sb-novo-migrator-na-2025-01-27v2.veevavault.com/api/v25.1/vobjects/em_speaker__v/`;

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


  @Get('speaker/:id')
  @ApiBearerAuth('vault-auth')
  @ApiOperation({ summary: 'retreieve speaker   by id from Veeva Vault' })
  @ApiHeader({
    name: 'auth',
    description: 'Vault Session ID (use /auth endpoint to get it)',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'retreieve speaker   by id from Veeva Vault',
  })
  @ApiResponse({ status: 400, description: 'Missing or invalid token' })
  async listAllSpeakerById(@Headers() headers: Record<string, string>, @Param('id') id: string,): Promise<any> {
    const authToken = headers['auth']; // must use lowercase
    console.log('AUTHHHHH', authToken);

    if (!authToken) {
      throw new HttpException('Missing Authorization header', HttpStatus.BAD_REQUEST);
    }

    const url = `https://sb-novo-migrator-na-2025-01-27v2.veevavault.com/api/v25.1/vobjects/em_speaker__v/${id}`;

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





    @Get('speakers_qualifications')
  @ApiBearerAuth('vault-auth')
  @ApiOperation({ summary: 'List All speakers  qualifications from Veeva Vault' })
  @ApiHeader({
    name: 'auth',
    description: 'Vault Session ID (use /auth endpoint to get it)',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'List All speakers  qualifications from Veeva Vault',
  })
  @ApiResponse({ status: 400, description: 'Missing or invalid token' })
  async listAllSpeakersqualifications(@Headers() headers: Record<string, string>): Promise<any> {
    const authToken = headers['auth'];
    console.log('AUTHHHHH', authToken);

    if (!authToken) {
      throw new HttpException('Missing Authorization header', HttpStatus.BAD_REQUEST);
    }

    const url = `https://sb-novo-migrator-na-2025-01-27v2.veevavault.com/api/v25.1/vobjects/em_speaker_qualification__v/`;

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


  @Get('speaker_qualification/:id')
  @ApiBearerAuth('vault-auth')
  @ApiOperation({ summary: 'retreieve speaker  Qualifications by id from Veeva Vault' })
  @ApiHeader({
    name: 'auth',
    description: 'Vault Session ID (use /auth endpoint to get it)',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'retreieve speaker Qualifications  by id from Veeva Vault',
  })
  @ApiResponse({ status: 400, description: 'Missing or invalid token' })
  async listAllSpeakerQualificationsById(@Headers() headers: Record<string, string>, @Param('id') id: string,): Promise<any> {
    const authToken = headers['auth']; // must use lowercase
    console.log('AUTHHHHH', authToken);

    if (!authToken) {
      throw new HttpException('Missing Authorization header', HttpStatus.BAD_REQUEST);
    }

    const url = `https://sb-novo-migrator-na-2025-01-27v2.veevavault.com/api/v25.1/vobjects/em_speaker_qualification__v/${id}`;

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