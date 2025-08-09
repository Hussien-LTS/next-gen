
import { Body, Controller, Get, Header, Headers, HttpException, HttpStatus, Param, Post } from '@nestjs/common';
import { VaultService } from './services/vault.service';
import { ApiTags, ApiBearerAuth, ApiHeader, ApiOperation, ApiParam, ApiResponse, ApiBody, ApiProperty } from '@nestjs/swagger';
import { VaultAuthDto } from './models/vaultauth.model';
import { Response } from 'express';
import axios from 'axios';
import { AttachmentDto } from './models/attachment_dto.model';


@Controller('vvbudget')
@ApiTags('VeevaVault Budget APis')
export class VaultBudgetController {


 
  @Get('budgets')
  @ApiBearerAuth('vault-auth')
  @ApiOperation({ summary: 'List All budgets from Veeva Vault' })
  @ApiHeader({
    name: 'auth',
    description: 'Vault Session ID (use /auth endpoint to get it)',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'List of all budgets from Veeva Vault',
  })
  @ApiResponse({ status: 400, description: 'Missing or invalid token' })
  async listAllbudgets(@Headers() headers: Record<string, string>): Promise<any> {
    const authToken = headers['auth'];
    console.log('AUTHHHHH', authToken);

    if (!authToken) {
      throw new HttpException('Missing Authorization header', HttpStatus.BAD_REQUEST);
    }

    const url = `https://sb-novo-migrator-na-2025-01-27v2.veevavault.com/api/v20.3/vobjects/em_budget__v/`;

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


  @Get('budget/:id')
  @ApiBearerAuth('vault-auth')
  @ApiOperation({ summary: 'retreive budget by id  from Veeva Vault' })
  @ApiHeader({
    name: 'auth',
    description: 'Vault Session ID (use /auth endpoint to get it)',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'retreive budget by id  from Veeva Vault',
  })
  @ApiResponse({ status: 400, description: 'Missing or invalid token' })
  async listAllEventsById(@Headers() headers: Record<string, string>, @Param('id') id: string,): Promise<any> {
    const authToken = headers['auth'];  
    console.log('AUTHHHHH', authToken);

    if (!authToken) {
      throw new HttpException('Missing Authorization header', HttpStatus.BAD_REQUEST);
    }

    const url = `https://sb-novo-migrator-na-2025-01-27v2.veevavault.com/api/v20.3/vobjects/em_budget__v/${id}`;

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




  
  @Get('event_budgets')
  @ApiBearerAuth('vault-auth')
  @ApiOperation({ summary: 'List All event_budgets from Veeva Vault' })
  @ApiHeader({
    name: 'auth',
    description: 'Vault Session ID (use /auth endpoint to get it)',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'List of all event_budgets from Veeva Vault',
  })
  @ApiResponse({ status: 400, description: 'Missing or invalid token' })
  async listAllEventsbudgets(@Headers() headers: Record<string, string>): Promise<any> {
    const authToken = headers['auth'];
    console.log('AUTHHHHH', authToken);

    if (!authToken) {
      throw new HttpException('Missing Authorization header', HttpStatus.BAD_REQUEST);
    }

    const url = `https://sb-novo-migrator-na-2025-01-27v2.veevavault.com/api/v20.3/vobjects/em_event_budget__v/`;

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


  @Get('event_budget/:id')
  @ApiBearerAuth('vault-auth')
  @ApiOperation({ summary: 'retreive event_budget by id  from Veeva Vault' })
  @ApiHeader({
    name: 'auth',
    description: 'Vault Session ID (use /auth endpoint to get it)',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'retreive event_budget by id  from Veeva Vault',
  })
  @ApiResponse({ status: 400, description: 'Missing or invalid token' })
  async listAllEventsBudgetsById(@Headers() headers: Record<string, string>, @Param('id') id: string,): Promise<any> {
    const authToken = headers['auth'];  
    console.log('AUTHHHHH', authToken);

    if (!authToken) {
      throw new HttpException('Missing Authorization header', HttpStatus.BAD_REQUEST);
    }

    const url = `https://sb-novo-migrator-na-2025-01-27v2.veevavault.com/api/v20.3/vobjects/em_event_budget__v/${id}`;

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



  
  @Get('expense_estimate')
  @ApiBearerAuth('vault-auth')
  @ApiOperation({ summary: 'List All expense_estimate from Veeva Vault' })
  @ApiHeader({
    name: 'auth',
    description: 'Vault Session ID (use /auth endpoint to get it)',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'List of all expense_estimate from Veeva Vault',
  })
  @ApiResponse({ status: 400, description: 'Missing or invalid token' })
  async listAllexpense_estimate(@Headers() headers: Record<string, string>): Promise<any> {
    const authToken = headers['auth'];
    console.log('AUTHHHHH', authToken);

    if (!authToken) {
      throw new HttpException('Missing Authorization header', HttpStatus.BAD_REQUEST);
    }

    const url = `https://sb-novo-migrator-na-2025-01-27v2.veevavault.com/api/v20.3/vobjects/em_expense_estimate__v/`;

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


  @Get('expense_estimate/:id')
  @ApiBearerAuth('vault-auth')
  @ApiOperation({ summary: 'retreive expense_estimate by id  from Veeva Vault' })
  @ApiHeader({
    name: 'auth',
    description: 'Vault Session ID (use /auth endpoint to get it)',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'retreive expense_estimate by id  from Veeva Vault',
  })
  @ApiResponse({ status: 400, description: 'Missing or invalid token' })
  async listAllexpense_estimateById(@Headers() headers: Record<string, string>, @Param('id') id: string,): Promise<any> {
    const authToken = headers['auth'];  
    console.log('AUTHHHHH', authToken);

    if (!authToken) {
      throw new HttpException('Missing Authorization header', HttpStatus.BAD_REQUEST);
    }

    const url = `https://sb-novo-migrator-na-2025-01-27v2.veevavault.com/api/v20.3/vobjects/em_expense_estimate__v/${id}`;

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