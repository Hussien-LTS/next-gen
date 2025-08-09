export function mapTransactionLogPayload({
  name,
  success,
  errorMessage = '',
  logType,
  direction,
  owner = '',
}: {
  name: string;
  success: boolean;
  errorMessage?: string;
  logType: string;
  direction: string;
  owner?: string;
}) {
  const now = new Date().toISOString();

  return {
    ModifiedDateTime: now,
    Name: name,
    ErrorMessage: errorMessage,
    Success: success ? 'true' : 'false',
    Direction: direction,
    LogType: logType,
    Owner: owner,
    ProcessCompletionTime: now,
  };
}
