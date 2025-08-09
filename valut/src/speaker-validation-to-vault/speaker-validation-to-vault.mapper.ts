import { SyncSpeakerDto } from './DTOs/speaker-validation-sync.dto';

export function mapDraftEventBody(speakerData: SyncSpeakerDto) {
  return {
    ineligible_at_time_of_creation__c:
      speakerData?.Status !== 'Processed' ? true : false,
    ineligible_reason_at_time_of_creation__c: speakerData?.reason,
  };
}

export function mapCopmletedEventBody(speakerData: SyncSpeakerDto) {
  return {
    ineligible_at_time_of_submission__c:
      speakerData?.Status !== 'Processed' ? true : false,
    ineligible_reason_at_time_of_submission__c: speakerData?.reason,
  };
}
