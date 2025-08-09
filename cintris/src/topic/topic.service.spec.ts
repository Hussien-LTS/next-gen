
import { Test, TestingModule } from '@nestjs/testing';
import { TopicService } from './topic.service';
import { RabbitMQService } from '../shared/rabbitmq/rabbitmq.service';
import { SalesforceTopicDto } from './DTOs/create-salesforce-topic.dto';
import { Logger } from '@nestjs/common';

describe('TopicService', () => {
  let service: TopicService;
  let rmqService: RabbitMQService;

  const mockRmqService = {
    emit: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TopicService,
        {
          provide: RabbitMQService,
          useValue: mockRmqService,
        },
      ],
    }).compile();

    service = module.get<TopicService>(TopicService);
    rmqService = module.get<RabbitMQService>(RabbitMQService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should emit data to RabbitMQ and return success response', async () => {
      const dto: SalesforceTopicDto = {
        TransactionId: 'txn-1',
        topicList: [
          {
            TopicType: 'Type A',
            TopicID: '101',
            TopicDescription: 'Description A',
            ExternalId: 'ext-101',
          },
        ],
      };

      const loggerSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation(() => {});

      const result = await service.create(dto);

      expect(rmqService.emit).toHaveBeenCalledWith('salesforce-topic-created', dto);
      expect(result).toEqual({
        success: true,
        message: 'Topic created successfully',
        data: dto,
      });

      expect(loggerSpy).toHaveBeenCalledWith('🚀 ~ TopicService ~ create ~ create:');
      expect(loggerSpy).toHaveBeenCalledWith(dto);
      expect(loggerSpy).toHaveBeenCalledWith('🚀 ~ TopicService ~ create ~ Message sent to RabbitMQ');
      
      loggerSpy.mockRestore();
    });
  });
});