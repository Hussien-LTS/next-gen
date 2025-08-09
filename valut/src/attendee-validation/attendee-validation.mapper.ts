export function attendeeValidationMapper(
    transactionId,
    attendeeInfo,
    eventInfo,
    accountRes,
  ) {
    console.log('🚀 ~ eventInfo:', eventInfo);
    return {
      transactionId: transactionId,
      startDate: attendeeInfo['event__vr.start_date__v'],
      endDate: attendeeInfo['event__vr.end_date__v'],
      region: eventInfo['country__vr.name__v'],
      hcpId: [accountRes['external_id__v']],
      eventAttendeeId: [attendeeInfo?.id],
      status: false,
      InterationType: attendeeInfo['object_type__vr.name__v'],
      interactionId: attendeeInfo['object_type__vr.id'],
      topic: attendeeInfo['event__vr.topic__v'],
      getData: 'true',
      role: 'Attendee',
      durationType: null,
      travelType: null,
      spendType: null,
    };
  }
  
  export function mapAttendeeValidationToHCPEligibility(attendeeInfo, eventInfo) {
    console.log('🚀🚀🚀🚀🚀 ~ attendeeInfo:', attendeeInfo);
    return {
      ExternalId: attendeeInfo.id,
      StartDate: attendeeInfo['event__vr.start_date__v'],
      EndDate: attendeeInfo['event__vr.end_date__v'],
      Region: eventInfo['country__vr.name__v'],
      ExternalSpeakerId: attendeeInfo.id,
      Status: 'false',
      EventSubType: attendeeInfo['object_type__vr.name__v'],
      EventType: attendeeInfo['object_type__vr.id'],
      Topic: attendeeInfo['event__vr.topic__v'],
      EventId: attendeeInfo['event__v'],
      ModifiedDateTime: new Date().toISOString(),
      Role: 'Attendee',
      DurationType: null,
      TravelType: null,
      SpendType: null,
    };
  }
  