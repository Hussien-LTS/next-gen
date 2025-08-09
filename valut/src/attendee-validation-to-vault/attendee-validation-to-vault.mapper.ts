import { SyncAttendeeDto } from './DTOs/attendee-validation-sync.dto';

export function mapDraftEventBody(attendeeData: SyncAttendeeDto) {
  return {
    ineligible_at_time_of_creation__c:
      attendeeData?.Status !== 'Processed' ? true : false,
    ineligible_reason_at_time_of_creation__c: attendeeData?.reason,
  };
}

export function mapCopmletedEventBody(attendeeData: SyncAttendeeDto) {
  return {
    ineligible_at_time_of_submission__c:
      attendeeData?.Status !== 'Processed' ? true : false,
    ineligible_reason_at_time_of_submission__c: attendeeData?.reason,
  };
}
