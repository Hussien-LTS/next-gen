import { Test, TestingModule } from '@nestjs/testing';
import { ConfigurableApiService } from './configurable-API.service';

describe('ConfigurableApiService', () => {
  let service: ConfigurableApiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ConfigurableApiService],
    }).compile();

    service = module.get<ConfigurableApiService>(ConfigurableApiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
