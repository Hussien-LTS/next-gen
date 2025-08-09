import { Controller, Param } from '@nestjs/common';
import { ExpansionRuleService } from './expansion-rule.service';
import { EventPattern, Payload } from '@nestjs/microservices';
import {
  CreateExpansionRuleDto,
  UpdateExpansionRuleDto,
} from './DTOs/expanion-rule.dto';

@Controller('expansion-rule')
export class ExpansionRuleController {
  constructor(private readonly expansionRuleService: ExpansionRuleService) {}

  @EventPattern('get_all_expansion_rule')
  async getAllExpansionRules(@Payload() query: { targetApiId: number }) {
    const { targetApiId } = query;
    return await this.expansionRuleService.getExpansionRules(targetApiId);
  }
  @EventPattern('get_expansion_rule_by_id')
  async getExpansionRuleById(@Payload() payload: { id: number }) {
    const { id } = payload;
    return this.expansionRuleService.getExpansionRuleById(id);
  }

  @EventPattern('create_expansion_rule')
  async createExpansionRule(
    @Payload() payload: { body: CreateExpansionRuleDto },
  ) {
    const { body } = payload;
    return await this.expansionRuleService.createExpansionRule(body);
  }

  @EventPattern('update_expansion_rule')
  async updateExpansionRule(
    @Payload() payload: { body: UpdateExpansionRuleDto; id: number },
  ) {
    const { body, id } = payload;
    return this.expansionRuleService.updateExpansionRule(id, body);
  }

  @EventPattern('delete_expansion_rule')
  deleteExpansionRule(@Payload() payload: { id: number }) {
    const { id } = payload;
    return this.expansionRuleService.deleteExpansionRule(id);
  }
}
