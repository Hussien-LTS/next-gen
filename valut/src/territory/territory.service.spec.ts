import { Test, TestingModule } from '@nestjs/testing';
import { TerritoryService } from './territory.service';
import { ConfigService } from '@nestjs/config';
import { RabbitMQService } from '../shared/rabbitmq/rabbitmq.service';
import axios from 'axios';
import { HttpException, HttpStatus } from '@nestjs/common';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('TerritoryService', () => {
  let service: TerritoryService;
  let configService: ConfigService;
  let rabbitMQService: RabbitMQService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TerritoryService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) =>
              key === 'VAULT_BASE_URL'
                ? 'http://test-base-url.com'
                : 'test-client-id',
            ),
          },
        },
        {
          provide: RabbitMQService,
          useValue: {
            emit: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<TerritoryService>(TerritoryService);
    configService = module.get<ConfigService>(ConfigService);
    rabbitMQService = module.get<RabbitMQService>(RabbitMQService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('listAllTerritories', () => {
    it('should throw if no authToken is provided', async () => {
      await expect(service.listAllTerritories('')).rejects.toThrow(
        new HttpException('Missing Authorization header', HttpStatus.BAD_REQUEST),
      );
    });

    it('should return data on success', async () => {
      const fakeResponse = { data: { key: 'value' } };
      mockedAxios.request.mockResolvedValueOnce(fakeResponse);

      const result = await service.listAllTerritories('token-123');
      expect(result).toEqual(fakeResponse.data);
      expect(mockedAxios.request).toHaveBeenCalled();
    });
  });

  describe('listTerritoryById', () => {
    it('should throw if no authToken is provided', async () => {
      await expect(service.listTerritoryById('', '123')).rejects.toThrow(
        new HttpException('Missing Authorization header', HttpStatus.BAD_REQUEST),
      );
    });

    it('should emit events and return mapped territory on success', async () => {
      const apiData = {
        id: '123',
        modified_date__v: '2023-01-01T00:00:00Z',
        nni_territory_id__c: 'EXT-ID',
        parent_territory__v: null,
        name__v: 'Territory Name',
      };

      mockedAxios.request.mockResolvedValueOnce({ data: { data: apiData } });

      const result = await service.listTerritoryById('token-xyz', '123');

      expect(result).toEqual({
        Id: '123',
        ModifiedDateTime: '2023-01-01T00:00:00Z',
        ExternalId: 'EXT-ID',
        ExternalParentId: null,
        Name: 'Territory Name',
      });

      expect(rabbitMQService.emit).toHaveBeenCalledTimes(2);
    });

    it('should throw an HttpException on error', async () => {
      mockedAxios.request.mockRejectedValueOnce({
        response: { data: { message: 'Failure' } },
      });

      await expect(service.listTerritoryById('token', 'invalid')).rejects.toThrow(
        expect.objectContaining({
          response: {
            status: HttpStatus.BAD_REQUEST,
            error: { message: 'Failure' },
          },
        }),
      );
    });
  });

  describe('updateTerritory', () => {
    it('should throw if no authToken is provided', async () => {
      await expect(service.updateTerritory('', '123', {})).rejects.toThrow(
        new HttpException('Authorization token is missing', HttpStatus.BAD_REQUEST),
      );
    });

    it('should return confirmation on success', async () => {
      mockedAxios.request.mockResolvedValueOnce({
        data: { responseStatus: 'SUCCESS' },
      });

      const result = await service.updateTerritory('token', '123', { name__v: 'Updated' });

      expect(result).toEqual({
        msg: 'Territory Updated SUCCESS',
        data: { responseStatus: 'SUCCESS' },
      });
    });

    it('should throw HttpException if axios fails', async () => {
      mockedAxios.request.mockRejectedValueOnce({
        response: { data: { error: 'Something went wrong' }, status: 500 },
      });

      await expect(service.updateTerritory('token', 'bad-id', {})).rejects.toThrow(
        expect.objectContaining({
          response: { error: 'Something went wrong' },
          status: 500,
        }),
      );
    });
  });
});
