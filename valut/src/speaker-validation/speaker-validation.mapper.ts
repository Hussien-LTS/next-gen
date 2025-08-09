export function speakerValidationMapper(
  transactionId,
  speakerInfo,
  eventInfo,
  accountRes,
) {
  console.log('🚀 ~ eventInfo:', eventInfo);
  return {
    transactionId: transactionId,
    startDate: speakerInfo['event__vr.start_date__v'],
    endDate: speakerInfo['event__vr.end_date__v'],
    region: eventInfo['country__vr.name__v'],
    hcpId: [accountRes['external_id__v']],
    eventSpeakerId: [speakerInfo?.id],
    status: false,
    InterationType: speakerInfo['object_type__vr.name__v'],
    interactionId: speakerInfo['event__vr.centris_id__c'],
    topic: speakerInfo['event__vr.topic__v'],
    getData: 'true',
    role: 'Speaker',
    durationType: null,
    travelType: null,
    spendType: null,
  };
}

export function mapSpeakerValidationToHCPEligibility(speakerInfo, eventInfo) {
  return {
    ExternalId: speakerInfo.id,
    StartDate: speakerInfo['event__vr.start_date__v'],
    EndDate: speakerInfo['event__vr.end_date__v'],
    Region: eventInfo['country__vr.name__v'],
    ExternalSpeakerId: speakerInfo.id,
    Status: 'false',
    EventSubType: speakerInfo['object_type__vr.name__v'],
    EventType: speakerInfo['object_type__vr.id'],
    Topic: speakerInfo['event__vr.topic__v'],
    EventId: speakerInfo['event__v'],
    ModifiedDateTime: new Date().toISOString(),
    Role: 'Speaker',
    DurationType: null,
    TravelType: null,
    SpendType: null,
  };
}
