import { Attachment } from "src/entities/attachment.entity";


export function mapApiResponseToAttachment(data: any): Attachment {
  const attachment = new Attachment();
 attachment.Id = data.id;
 attachment.ModifiedDateTime = data.modified_date__v ?? null;
 attachment.ExternalId = data.nni_territory_id__c ?? null;
 attachment.Body = data.Body ?? null;
 attachment.BodyLength = data.BodyLength ?? null;
 attachment.ContentType = data.ContentType ?? null;
 attachment.Name = data.Name ?? null;
 attachment.ExternalRecordId = data.ExternalRecordId ?? null;
 attachment.ExternalRecordName = data.ExternalRecordName ?? null;
  return attachment;
}
