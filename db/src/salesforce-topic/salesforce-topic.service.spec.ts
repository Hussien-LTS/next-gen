import { Test, TestingModule } from '@nestjs/testing';
import { SalesforceTopicService } from './salesforce-topic.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TopicTransaction } from '../entities/topic-salesforce-transaction.entity';
import { TopicSalesforce } from '../entities/topic-salesforce.entity';
import { Repository } from 'typeorm';
import { Logger } from '@nestjs/common';

describe('SalesforceTopicService', () => {
  let service: SalesforceTopicService;
  let transactionRepo: Repository<TopicTransaction>;
  let salesforceRepo: Repository<TopicSalesforce>;

  const mockTransactionRepo = {
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockSalesforceRepo = {
    create: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SalesforceTopicService,
        {
          provide: getRepositoryToken(TopicTransaction),
          useValue: mockTransactionRepo,
        },
        {
          provide: getRepositoryToken(TopicSalesforce),
          useValue: mockSalesforceRepo,
        },
      ],
    }).compile();

    service = module.get<SalesforceTopicService>(SalesforceTopicService);
    transactionRepo = module.get(getRepositoryToken(TopicTransaction));
    salesforceRepo = module.get(getRepositoryToken(TopicSalesforce));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('handleTopicCreated', () => {
    it('should create and save transaction and topics', async () => {
      const mockData = {
        TransactionId: 'txn123',
        topicList: [
          {
            TopicType: 'type1',
            TopicID: 'id1',
            TopicDescription: 'desc1',
            ExternalId: 'ext1',
          },
          {
            TopicType: 'type2',
            TopicID: 'id2',
            TopicDescription: 'desc2',
            ExternalId: 'ext2',
          },
        ],
      };

      const mockTransactionEntity = { id: 1, TransactionId: 'txn123' };
      mockTransactionRepo.create.mockReturnValue(mockTransactionEntity);
      mockTransactionRepo.save.mockResolvedValue(mockTransactionEntity);

      mockSalesforceRepo.create.mockImplementation((topic) => topic);
      mockSalesforceRepo.save.mockResolvedValue({});

      await service.handleTopicCreated(mockData);

      expect(transactionRepo.create).toHaveBeenCalledWith({
        TransactionId: 'txn123',
      });
      expect(transactionRepo.save).toHaveBeenCalledWith(mockTransactionEntity);

      expect(salesforceRepo.create).toHaveBeenCalledTimes(2);
      expect(salesforceRepo.save).toHaveBeenCalledTimes(2);
      expect(salesforceRepo.create).toHaveBeenCalledWith({
        TopicType: 'type1',
        TopicID: 'id1',
        TopicDescription: 'desc1',
        ExternalId: 'ext1',
        transaction: mockTransactionEntity,
      });
    });
 it('should handle errors gracefully', async () => {
      const mockData = {
        TransactionId: 'txn123',
        topicList: [],
      };
      const error = new Error('DB Error');

      mockTransactionRepo.create.mockImplementation(() => {
        throw error;
      });

      const logSpy = jest
        .spyOn(Logger.prototype, 'error')
        .mockImplementation(() => {});

      await service.handleTopicCreated(mockData);

      expect(logSpy).toHaveBeenCalledWith(error);
      logSpy.mockRestore();
    });
  });
});