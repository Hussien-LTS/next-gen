
import { Body, Controller, Get, Header, Headers, HttpException, HttpStatus, Param, Post } from '@nestjs/common';
import { VaultService } from './services/vault.service';
import { ApiTags, ApiBearerAuth, ApiHeader, ApiOperation, ApiParam, ApiResponse, ApiBody, ApiProperty } from '@nestjs/swagger';
import { VaultAuthDto } from './models/vaultauth.model';
import { Response } from 'express';
import axios from 'axios';
import { AttachmentDto } from './models/attachment_dto.model';


@Controller('vvterritory')
@ApiTags('VeevaVault Terittory APis')
export class VaultTeritorryController {

    // @Get()
    // @ApiOperation({ summary: 'List All Territory in Veeva Vault' })

    // getVault(): string {
    //     return "this.appService.getVault()";
    // }

    
  @Get('territories')
  @ApiBearerAuth('vault-auth')
  @ApiOperation({ summary: 'List All territories from Veeva Vault' })
  @ApiHeader({
    name: 'auth',
    description: 'Vault Session ID (use /auth endpoint to get it)',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'List of all territories from Veeva Vault',
  })
  @ApiResponse({ status: 400, description: 'Missing or invalid token' })
  async listAllTerritories(@Headers() headers: Record<string, string>): Promise<any> {
    const authToken = headers['auth'];
    console.log('AUTHHHHH', authToken);

    if (!authToken) {
      throw new HttpException('Missing Authorization header', HttpStatus.BAD_REQUEST);
    }

    const url = `https://sb-novo-migrator-na-2025-01-27v2.veevavault.com/api/v20.3/vobjects/territory__v/`;

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


  @Get('territory/:id')
  @ApiBearerAuth('vault-auth')
  @ApiOperation({ summary: 'retreive territory by id from Veeva Vault' })
  @ApiHeader({
    name: 'auth',
    description: 'Vault Session ID (use /auth endpoint to get it)',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'retreive territory by id from Veeva Vault',
  })
  @ApiResponse({ status: 400, description: 'Missing or invalid token' })
  async listAllTerritoryById(@Headers() headers: Record<string, string>, @Param('id') id: string,): Promise<any> {
    const authToken = headers['auth']; // must use lowercase
    console.log('AUTHHHHH', authToken);

    if (!authToken) {
      throw new HttpException('Missing Authorization header', HttpStatus.BAD_REQUEST);
    }

    const url = `https://sb-novo-migrator-na-2025-01-27v2.veevavault.com/api/v20.3/vobjects/territory__v/${id}`;

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