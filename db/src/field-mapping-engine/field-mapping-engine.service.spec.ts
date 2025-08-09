import { Test, TestingModule } from '@nestjs/testing';
import { FieldMappingEngineService } from './field-mapping-engine.service';

describe('FieldMappingEngineService', () => {
  let service: FieldMappingEngineService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FieldMappingEngineService],
    }).compile();

    service = module.get<FieldMappingEngineService>(FieldMappingEngineService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
