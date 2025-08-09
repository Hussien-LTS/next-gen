import { Test, TestingModule } from '@nestjs/testing';
import { AttachmentService } from './attachment.service';
import { ConfigService } from '@nestjs/config';
import { RabbitMQService } from '../shared/rabbitmq/rabbitmq.service';
import axios from 'axios';
import { HttpException } from '@nestjs/common';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('getAttachmentById', () => {
  let service: AttachmentService;
  let rmqService: RabbitMQService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AttachmentService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockImplementation((key: string) => {
              if (key === 'VAULT_BASE_URL') return 'https://fake-vault-url.com';
              if (key === 'VAULT_CLIENT_ID') return 'fake-client-id';
              return null;
            }),
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

    service = module.get<AttachmentService>(AttachmentService);
    rmqService = module.get<RabbitMQService>(RabbitMQService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should throw HttpException if authToken is missing', async () => {
    await expect(service.getAttachmentById('', '123')).rejects.toThrow(
      HttpException,
    );
  });

  it('should call axios and rmqService.emit, and return response data on success', async () => {
    const fakeResponse = {
      data: {
        data: { id: '123', name: 'Test Attachment' },
      },
    };
    mockedAxios.request.mockResolvedValueOnce(fakeResponse);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const result = await service.getAttachmentById('Bearer token', '123');

    expect(mockedAxios.request).toHaveBeenCalledWith({
      method: 'post',
      url: 'https://fake-vault-url.com/objects/documents/123',
      headers: {
        Authorization: 'Bearer token',
        Accept: 'application/json',
        'X-VaultAPI-ClientID': 'fake-client-id',
      },
      data: {
        AttachmentId: '123',
      },
    });
  });

  it('should throw HttpException with error response data if axios fails', async () => {
    const errorResponse = {
      isAxiosError: true,
      response: {
        data: { message: 'Not found' },
        status: 404,
      },
      message: 'Request failed with status code 404',
    };
    mockedAxios.request.mockRejectedValueOnce(errorResponse);

    await expect(
      service.getAttachmentById('Bearer token', '123'),
    ).rejects.toThrow(HttpException);

    try {
      await service.getAttachmentById('Bearer token', '123');
    } catch (e: any) {
      expect(e.getStatus()).toBe(500);
    }
  });
});
