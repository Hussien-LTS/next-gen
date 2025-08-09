import { Test, TestingModule } from '@nestjs/testing';
import { TopicService } from './topic.service';
import { ConfigService } from '@nestjs/config';
import { RabbitMQService } from '../shared/rabbitmq/rabbitmq.service';
import axios from 'axios';
import { UnauthorizedException, HttpException } from '@nestjs/common';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('TopicService', () => {
  let service: TopicService;
  let configService: ConfigService;
  let rmqService: RabbitMQService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TopicService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'VAULT_BASE_URL') return 'http://fake-url.com';
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

    service = module.get<TopicService>(TopicService);
    configService = module.get<ConfigService>(ConfigService);
    rmqService = module.get<RabbitMQService>(RabbitMQService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getTopics', () => {
    it('should throw UnauthorizedException if token or clientId missing', async () => {
      (configService.get as jest.Mock).mockReturnValueOnce(null); // no baseUrl
      await expect(service.getTopics('')).rejects.toThrow(UnauthorizedException);
    });

    it('should return topic response and emit to RMQ', async () => {
      const fakeResponse = {
        data: {
          responseStatus: 'SUCCESS',
          responseDetails: { total: 10 },
          data: [{ id: '123', name: 'Test Topic' }],
        },
      };
      mockedAxios.request.mockResolvedValue(fakeResponse);

      const result = await service.getTopics('Bearer test-token');

      expect(mockedAxios.request).toHaveBeenCalled();
      expect(rmqService.emit).toHaveBeenCalledWith('All_Topics_data', fakeResponse.data);
      expect(result).toEqual({
        responseStatus: 'SUCCESS',
        responseDetails: { total: 10 },
        data: [{ id: '123', name: 'Test Topic' }],
      });
    });

    it('should throw HttpException on axios failure', async () => {
      mockedAxios.request.mockRejectedValue({
        response: { data: 'Bad Request', status: 400 },
        message: 'Request failed',
      });

      await expect(service.getTopics('Bearer test-token')).rejects.toThrow(HttpException);
    });
  });

  describe('getTopicById', () => {
    it('should throw UnauthorizedException if token or clientId missing', async () => {
      (configService.get as jest.Mock).mockReturnValueOnce(null); // no baseUrl
      await expect(service.getTopicById('', 'topic123')).rejects.toThrow(UnauthorizedException);
    });

    it('should return topic data and emit to RMQ', async () => {
      const fakeResponse = {
        data: {
          id: '123',
          name: 'Topic Name',
        },
      };
      mockedAxios.request.mockResolvedValue(fakeResponse);

      const result = await service.getTopicById('Bearer test-token', '123');

      expect(mockedAxios.request).toHaveBeenCalled();
      expect(rmqService.emit).toHaveBeenCalledWith('topicId_data', fakeResponse.data);
      expect(result).toEqual({ data: fakeResponse.data });
    });

    it('should throw HttpException if topic not found', async () => {
      mockedAxios.request.mockResolvedValue({ data: null });

      await expect(service.getTopicById('Bearer test-token', 'notFound')).rejects.toThrow(HttpException);
    });

    it('should throw HttpException on axios failure', async () => {
      mockedAxios.request.mockRejectedValue({
        response: { data: 'Not Found', status: 404 },
        message: 'Topic not found',
      });

      await expect(service.getTopicById('Bearer test-token', 'invalid')).rejects.toThrow(HttpException);
    });
  });
});
