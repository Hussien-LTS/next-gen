import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';

const mockUserRepo = () => ({
  findOneBy: jest.fn(),
  update: jest.fn(),
  insert: jest.fn(),
});

jest.mock('./users.mapper', () => ({
  mapToUserEntity: jest.fn().mockImplementation((data) => ({
    Id: data.id,
    ExternalId: data.external_id,
  })),
}));

describe('UsersService', () => {
  let service: UsersService;
  let userRepo: ReturnType<typeof mockUserRepo>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useFactory: mockUserRepo,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userRepo = module.get(getRepositoryToken(User));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const mockUserData = [
    {
      id: 'U-001',
      external_id: 'EXT-123',
    },
  ];

  it('should insert new user if not exists', async () => {
    userRepo.findOneBy.mockResolvedValue(null);

    await service.createUser(mockUserData);

    expect(userRepo.insert).toHaveBeenCalledWith(
      expect.objectContaining({ Id: 'U-001' }),
    );
    expect(userRepo.update).not.toHaveBeenCalled();
  });

  it('should update user if exists and has ExternalId', async () => {
    userRepo.findOneBy.mockResolvedValue({ Id: 'U-001' });

    await service.createUser(mockUserData);

    expect(userRepo.update).toHaveBeenCalledWith(
      { Id: 'U-001' },
      expect.objectContaining({ ExternalId: 'EXT-123' }),
    );
    expect(userRepo.insert).not.toHaveBeenCalled();
  });

  it('should do nothing if user exists and no ExternalId', async () => {
    const noExtIdData = [{ id: 'U-001', external_id: null }];
    userRepo.findOneBy.mockResolvedValue({ Id: 'U-001' });

    await service.createUser(noExtIdData);

    expect(userRepo.update).not.toHaveBeenCalled();
    expect(userRepo.insert).not.toHaveBeenCalled();
  });

  it('should throw an error if repository throws', async () => {
    userRepo.findOneBy.mockRejectedValue(new Error('DB error'));

    await expect(service.createUser(mockUserData)).rejects.toThrow(
      'Failed to save user information.',
    );
  });
});
