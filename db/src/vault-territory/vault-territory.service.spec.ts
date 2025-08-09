import { Test, TestingModule } from '@nestjs/testing';
import { VaultTerritoryService } from './vault-territory.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Territory } from '../entities/territory.entity';
import { TransactionLogService } from '../transaction-log/transaction-log.service';

const mockTerritoryRepo = () => ({
  findOneBy: jest.fn(),
  update: jest.fn(),
  insert: jest.fn(),
});

const mockTransactionLogService = () => ({
  create: jest.fn(),
});

describe('VaultTerritoryService', () => {
  let service: VaultTerritoryService;
  let territoryRepo: ReturnType<typeof mockTerritoryRepo>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VaultTerritoryService,
        {
          provide: getRepositoryToken(Territory),
          useFactory: mockTerritoryRepo,
        },
        {
          provide: TransactionLogService,
          useFactory: mockTransactionLogService,
        },
      ],
    }).compile();

    service = module.get<VaultTerritoryService>(VaultTerritoryService);
    territoryRepo = module.get(getRepositoryToken(Territory));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const mockApiData = {
    id: 'T-001',
    modified_date__v: '2024-01-01T00:00:00Z',
    nni_territory_id__c: 'EXT-001',
    parent_territory__v: null,
    name__v: 'Test Territory',
  };

  it('should insert a new territory if it does not exist', async () => {
    territoryRepo.findOneBy.mockResolvedValue(null);

    await service.createVaultTerritory(mockApiData);

    expect(territoryRepo.insert).toHaveBeenCalledWith(
      expect.objectContaining({ Id: 'T-001' }),
    );
    expect(territoryRepo.update).not.toHaveBeenCalled();
  });

  it('should update territory if it exists and has ExternalId', async () => {
    territoryRepo.findOneBy.mockResolvedValue({ Id: 'T-001' });

    await service.createVaultTerritory(mockApiData);

    expect(territoryRepo.update).toHaveBeenCalledWith(
      { Id: 'T-001' },
      expect.objectContaining({ ExternalId: 'EXT-001' }),
    );
    expect(territoryRepo.insert).not.toHaveBeenCalled();
  });

  it('should do nothing if territory exists and has no ExternalId', async () => {
    const apiDataWithoutExternalId = {
      ...mockApiData,
      nni_territory_id__c: null,
    };
    territoryRepo.findOneBy.mockResolvedValue({ Id: 'T-001' });

    await service.createVaultTerritory(apiDataWithoutExternalId);

    expect(territoryRepo.update).not.toHaveBeenCalled();
    expect(territoryRepo.insert).not.toHaveBeenCalled();
  });

  it('should throw an error if repository throws', async () => {
    territoryRepo.findOneBy.mockRejectedValue(new Error('DB error'));

    await expect(service.createVaultTerritory(mockApiData)).rejects.toThrow(
      'Failed to save territory information.',
    );
  });
});
