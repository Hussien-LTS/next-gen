export function mapTransactionLogPayload({
  name,
  success,
  errorMessage = "",
  logType,
  direction,
  owner = "",
}: {
  name: string;
  success: string;
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
    Success: success,
    Direction: direction,
    LogType: logType,
    Owner: owner,
    ProcessCompletionTime: now,
  };
}
