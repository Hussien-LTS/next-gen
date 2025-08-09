import { Test, TestingModule } from '@nestjs/testing';
import { ExpansionRuleService } from './expansion-rule.service';

describe('ExpansionRuleService', () => {
  let service: ExpansionRuleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ExpansionRuleService],
    }).compile();

    service = module.get<ExpansionRuleService>(ExpansionRuleService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
