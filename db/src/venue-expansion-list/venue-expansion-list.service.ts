import { BadRequestException, Injectable } from '@nestjs/common';
import { ExpansionRuleService } from 'src/expansion-rule/expansion-rule.service';
import { FieldMappingEngineService } from 'src/field-mapping-engine/field-mapping-engine.service';

@Injectable()
export class VenueExpansionListService {
  constructor(
    private readonly fieldMappingEngine: FieldMappingEngineService,
    private readonly expansion: ExpansionRuleService,
  ) {}

  async getExpansionList(venueList: any) {
    try {
      let nono;
      const fieldMappings =
        await this.expansion.getExpansionRulesByApiName('venue');
      if (fieldMappings.length) {
        nono = await Promise.all(
          venueList.map(async (element) => {
            const inrichedPayload =
              await this.fieldMappingEngine.applyFieldMappings(
                fieldMappings,
                'awsToVault',
                element,
              );
            console.log(
              '🚀 ~ VenueExpansionListService ~ venueList.map ~ mappingField:',
              inrichedPayload.vaultFields,
            );

            return {
              ...element,
              extraField: inrichedPayload.vaultFields,
            };
          }),
        );
      }

      return nono;
    } catch (error) {
      console.log(
        '🚀 ~ VenueExpansionListService ~ getExpansionList ~ error:',
        error,
      );
      return new BadRequestException(error.message);
    }
  }
}
