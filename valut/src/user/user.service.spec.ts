import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { RabbitMQService } from '../shared/rabbitmq/rabbitmq.service';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('UserService', () => {
  let service: UserService;
  let rmqService: RabbitMQService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: ConfigService,
          useValue: { get: jest.fn((key) => 'test-value') },
        },
        { provide: HttpService, useValue: {} },
        {
          provide: RabbitMQService,
          useValue: {
            emit: jest.fn(),
            send: jest.fn().mockResolvedValue({ data: { Id: 'txn-123' } }),
          },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    rmqService = module.get<RabbitMQService>(RabbitMQService);
  });

  it('should fetch and process user data', async () => {
    const sessionId = 'test-session';
    const userIdArr = { userid: ['user1', 'user2'] };

    const mockUserData = { data: { data: 'user-data' } };
    mockedAxios.get.mockResolvedValue(mockUserData);

    const result = await service.getUserInfo(userIdArr, sessionId);

    expect(mockedAxios.get).toHaveBeenCalledTimes(2);
    expect(rmqService.emit).toHaveBeenCalledWith('vault-user-created', [
      mockUserData.data,
      mockUserData.data,
    ]);
    expect(rmqService.send).toHaveBeenCalled();
    expect(result).toEqual({
      userDataList: [expect.anything(), expect.anything()],
      transactionId: 'txn-123',
    });
  });
  it('should throw BadRequestException if axios throws an error', async () => {
    const sessionId = 'test-session';
    const userIdArr = { userid: ['bad-user'] };

    mockedAxios.get.mockRejectedValue(new Error('Axios failed'));

    await expect(service.getUserInfo(userIdArr, sessionId)).rejects.toThrow(
      'invalid body',
    );
  });
});
