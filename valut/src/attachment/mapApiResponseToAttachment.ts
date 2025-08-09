export function mapApiResponseToAttachment(
  data: any,
  attachmentId: string,
  eventId: string,
  transactionId: string,
): any {
  console.log('🚀 ~ mapApiResponseToAttachment ~ data:', data);

  if (!Array.isArray(data)) {
    return [];
  }

  return data.map((item: any) => ({
    id: item.id ?? null,
    Body: null,
    ContentType: item.format__v ?? null,
    Name: item.filename__v ?? null,
    eventId: eventId ?? null,
    TransactionId: transactionId ?? null,
    AttachmentId: attachmentId ?? null,
    BodyLength: item.size__v ?? null,
  }));
}
