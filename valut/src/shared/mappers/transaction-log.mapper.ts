interface TransactionLogDto {
  ModifiedDateTime: string;
  Name: string;
  ErrorMessage: string;
  Success: string;
  Direction: string;
  LogType: string;
  Owner: string;
  ProcessCompletionTime: string;
}
export function mapErrorToTransactionLog(errorData: any): TransactionLogDto {
  return {
    ModifiedDateTime: '',
    Name: 'Territory',
    ErrorMessage: errorData.errors?.[0]?.message || '',
    Success: errorData.responseStatus === 'FAILURE' ? 'false' : 'true',
    Direction: 'Outbound',
    LogType: 'Territory',
    Owner: '',
    ProcessCompletionTime: new Date().toISOString(),
  };
}

export function mapToTransactionLog(
  data: any,
  name: string,
  direction: string,
): TransactionLogDto {
  return {
    ModifiedDateTime: new Date().toISOString(),
    Name: name,
    ErrorMessage: '',
    Success: data.responseStatus === 'SUCCESS' ? 'true' : 'false',
    Direction: direction,
    LogType: name,
    Owner: data.data.ownerid__v,
    ProcessCompletionTime: new Date().toISOString(),
  };
}
