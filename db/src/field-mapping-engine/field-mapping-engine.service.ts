import { BadRequestException, Injectable, Logger } from '@nestjs/common';

@Injectable()
export class FieldMappingEngineService {
  private readonly logger = new Logger(FieldMappingEngineService.name);

  async applyFieldMappings(
    fieldMappings: Record<string, any>[],
    apiDirection: string,
    payload: Record<string, any>,
  ) {
    this.logger.log(`API Direction: ${apiDirection}`);

    try {
      if (!fieldMappings?.length) {
        return { vaultFields: [], centrisFields: [] };
      }

      if (apiDirection === 'vaultToAWS') {
        const result = this.vaultToAwsFields(payload, fieldMappings);
        console.log('\n\n expansion List =', result.centrisFields);
        return result;
      } else if (apiDirection === 'awsToVault') {
        if (!payload.expansionList || !payload.expansionList?.length) {
          return payload;
        }
        const result = this.awsToVaultFields(
          payload.expansionList,
          fieldMappings,
        );
        console.log('\n\n expansion List =', result.vaultFields);
        return result;
      } else {
        if (!payload.expansionList || !payload.expansionList?.length) {
          return payload;
        }

        const result = this.centrisToAWSFields(
          payload.expansionList,
          fieldMappings,
        );
        console.log('\n\n expansion List =', result.centrisFields);
        return result;
      }
    } catch (error) {
      this.logger.error(`DB fetch failed for : ${error.message}`);
      throw new BadRequestException(error.message);
    }
  }

  centrisToAWSFields(payload, dbPayload) {
    const vaultFields = [] as Record<string, unknown>[];
    const centrisFields = [] as Record<string, unknown>[];

    dbPayload.forEach((dbItem) => {
      const itemValue = payload.find(
        (item) => item.outBoundField === dbItem.centrisField,
      );

      if (!dbItem.allowNull && (itemValue == null || itemValue == undefined)) {
        this.logger.error(`${dbItem.centrisField} Is Not Allowed To Be Null`);
        throw new BadRequestException(
          `${dbItem.centrisField} Is Not Allowed To Be Null`,
        );
      }

      payload.forEach((payloadObj) => {
        if (payloadObj.outBoundField === dbItem.centrisField) {
          this.validateFieldMappings(payloadObj, dbItem);
          vaultFields.push({ [dbItem.vaultField]: payloadObj.actualValue });
          centrisFields.push({
            outBoundField: dbItem.centrisField,
            actualValue: payloadObj.actualValue,
          });
        }
      });
    });

    return { vaultFields, centrisFields };
  }

  awsToVaultFields(payload, dbPayload) {
    const vaultFields = [] as Record<string, unknown>[];
    const centrisFields = [] as Record<string, unknown>[];

    dbPayload.forEach((dbItem) => {
      const itemValue = payload.find(
        (item) => item.outBoundField === dbItem.centrisField,
      );

      if (!dbItem.allowNull && (itemValue == null || itemValue == undefined)) {
        this.logger.error(`${dbItem.vaultField} Is Not Allowed To Be Null`);
        throw new BadRequestException(
          `${dbItem.vaultField} Is Not Allowed To Be Null`,
        );
      }

      payload.forEach((payloadObj) => {
        if (payloadObj.outBoundField === dbItem.centrisField) {
          this.validateFieldMappings(payloadObj, dbItem);
          vaultFields.push({ [dbItem.vaultField]: payloadObj.actualValue });
          centrisFields.push({
            outBoundField: dbItem.centrisField,
            actualValue: payloadObj.actualValue,
          });
        }
      });
    });

    return { vaultFields, centrisFields };
  }

  vaultToAwsFields(payload, dbPayload) {
    const vaultFields = [] as Record<string, unknown>[];
    const centrisFields = [] as Record<string, unknown>[];

    dbPayload.forEach((dbItem) => {
      const itemValue = payload[dbItem.vaultField];

      if (!dbItem.allowNull && (itemValue == null || itemValue == undefined)) {
        this.logger.error(
          `${dbItem.vaultField} Is Required And Not Allowed To Be Null`,
        );
        throw new BadRequestException(
          `${dbItem.vaultField} Is Required And Not Allowed To Be Null`,
        );
      }

      for (const vaultKey in payload) {
        if (vaultKey === dbItem.vaultField) {
          this.validateFieldMappings(
            { outBoundField: vaultKey, actualValue: payload[vaultKey] },
            dbItem,
          );
          vaultFields.push({ [dbItem.vaultField]: payload[vaultKey] });
          centrisFields.push({
            outBoundField: dbItem.centrisField,
            actualValue: payload[vaultKey],
          });
        }
      }
    });

    return { vaultFields, centrisFields };
  }

  validateFieldMappings(payloadObj, databaseKey) {
    switch (databaseKey?.dataType?.toLowerCase()) {
      case 'string':
        if (
          typeof payloadObj?.actualValue !== 'string' ||
          (payloadObj.actualValue.trim() === '' && !databaseKey.allowNull)
        ) {
          throw new BadRequestException(
            `${payloadObj.outBoundField} Is Not a String`,
          );
        }
        break;
      case 'number':
        if (
          typeof payloadObj.actualValue !== 'number' ||
          typeof parseFloat(payloadObj.actualValue) !== 'number'
        ) {
          throw new BadRequestException(
            `${payloadObj.outBoundField} Is Not a Number`,
          );
        }
        break;

      case 'date':
        const value = payloadObj.actualValue;
        if (
          typeof value !== 'string' || // must be a string
          isNaN(Date.parse(value)) || // must be parsable
          !/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(?:\.\d+)?(Z|[\+\-]\d{2}:\d{2})?)?$/.test(
            value,
          ) // must match ISO format
        ) {
          throw new BadRequestException(
            `${payloadObj.outBoundField} Is Not a Valid ISO Date String.`,
          );
        }
        break;

      case 'boolean':
        const val = payloadObj.actualValue;

        const isBooleanLike =
          typeof val === 'boolean' ||
          val?.toString().toLowerCase() === 'true' ||
          val?.toString().toLowerCase() === 'false';

        if (!isBooleanLike) {
          throw new BadRequestException(
            `${payloadObj.outBoundField} Is Not a Valid Boolean Value`,
          );
        }
        break;

      default:
        throw new BadRequestException(
          `Data Type For: ${payloadObj.outBoundField} Is Not Supported`,
        );
    }
  }
}
