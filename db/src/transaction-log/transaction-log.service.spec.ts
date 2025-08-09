import { Test, TestingModule } from '@nestjs/testing';
import { TransactionLogService } from './transaction-log.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TransactionLog } from '../entities/transaction_log.entity';
import { Repository } from 'typeorm';

const mockTransactionLogRepo = () => ({
  save: jest.fn(),
});

describe('TransactionLogService', () => {
  let service: TransactionLogService;
  let transactionLogRepo: jest.Mocked<Repository<TransactionLog>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionLogService,
        {
          provide: getRepositoryToken(TransactionLog),
          useFactory: mockTransactionLogRepo,
        },
      ],
    }).compile();

    service = module.get<TransactionLogService>(TransactionLogService);
    transactionLogRepo = module.get(getRepositoryToken(TransactionLog));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully save a transaction log', async () => {
    const logData = { action: 'CREATE', entityId: '123', timestamp: new Date() };

    await service.create(logData);

    expect(transactionLogRepo.save).toHaveBeenCalledWith(logData);
  });

  it('should throw an error when save fails', async () => {
    transactionLogRepo.save.mockRejectedValue(new Error('DB Error'));

    await expect(service.create({})).rejects.toThrow('Failed to log transaction: DB Error');
  });
});
