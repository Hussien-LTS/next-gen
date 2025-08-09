import { ApiProperty } from '@nestjs/swagger';

// Sub-DTOs kept inside the same file, only CreateInteractionDto is exported

class TeamMember {
  @ApiProperty()
  userId: string;

  @ApiProperty()
  teamMemberId: string;

  @ApiProperty()
  role: string;

  @ApiProperty()
  ModifiedDateTime: string;

  @ApiProperty({ required: false })
  isOwner: string | null;

  @ApiProperty({ required: false })
  ExternalId: string | null;

  @ApiProperty()
  EventId: string;

  @ApiProperty({ type: [Object] })
  expansionList: { outBoundField: string; actualValue: string | null }[];
}

class EventSpeaker {
  @ApiProperty()
  status: string;

  @ApiProperty()
  speakerId: string;

  @ApiProperty()
  speakerAccId: string | null;

  @ApiProperty()
  PreferenceOrder: string;

  @ApiProperty()
  Preference: string;

  @ApiProperty()
  ModifiedDateTime: string;

  @ApiProperty()
  MealOptIn: string;

  @ApiProperty()
  InEligibleReasonAtTimeOfSubmission: string | null;

  @ApiProperty()
  InEligibleReasonAtTimeOfCreation: string | null;

  @ApiProperty()
  InEligibleAtTimeOfSubmission: string;

  @ApiProperty()
  InEligibleAtTimeOfCreation: string;

  @ApiProperty()
  externalId: string;

  @ApiProperty({ type: [Object] })
  expansionList: { outBoundField: string; actualValue: string | null }[];

  @ApiProperty()
  EventId: string;
}

class Attendee {
  @ApiProperty()
  WalkInStatus: string | null;

  @ApiProperty()
  Title: string | null;

  @ApiProperty()
  status: string;

  @ApiProperty()
  ProfileType: string | null;

  @ApiProperty()
  PostalCode: string | null;

  @ApiProperty()
  Phone: string | null;

  @ApiProperty()
  ModifiedDateTime: string;

  @ApiProperty()
  MealOptIn: string;

  @ApiProperty()
  LastName: string;

  @ApiProperty()
  InEligibleReasonAtTimeOfSubmission: string;

  @ApiProperty()
  InEligibleReasonAtTimeOfRSVP: string | null;

  @ApiProperty()
  InEligibleReasonAtTimeOfCreation: string;

  @ApiProperty()
  InEligibleReasonAtTimeOfAttendance: string | null;

  @ApiProperty()
  InEligibleAtTimeOfSubmission: string;

  @ApiProperty()
  InEligibleAtTimeOfRSVP: string;

  @ApiProperty()
  InEligibleAtTimeOfCreation: string;

  @ApiProperty()
  InEligibleAtTimeOfAttendance: string;

  @ApiProperty()
  FirstName: string;

  @ApiProperty()
  externalId: string | null;

  @ApiProperty({ type: [Object] })
  expansionList: { outBoundField: string; actualValue: string | null }[];

  @ApiProperty()
  EventId: string;

  @ApiProperty()
  Email: string | null;

  @ApiProperty()
  City: string | null;

  @ApiProperty()
  attendeeId: string;

  @ApiProperty()
  Address: string | null;

  @ApiProperty()
  accountExtId: string;
}

export class CreateInteractionDto {
  //   @ApiProperty()
  //   token: string;
  @ApiProperty()
  VenueState: string;

  @ApiProperty()
  VenuePostalCode: string;

  @ApiProperty()
  VenueName: string;

  @ApiProperty()
  VenueExternalId: string;

  @ApiProperty()
  VenueCity: string;

  @ApiProperty()
  VenueAddressLine2: string | null;

  @ApiProperty()
  VenueAddress: string;

  @ApiProperty()
  transactionId: string;

  @ApiProperty()
  TopicID: string;

  @ApiProperty({ type: [TeamMember] })
  TeamMemberList: TeamMember[];

  @ApiProperty()
  status: string;

  @ApiProperty()
  StartDateTime: string;

  @ApiProperty()
  ReconcilationStatus: string;

  @ApiProperty({ required: false })
  ParentEventId: string | null;

  @ApiProperty()
  ownerId: string;

  @ApiProperty({ required: false })
  latestApprovalCommentid: string | null;

  @ApiProperty({ required: false })
  latestApprovalComment: string | null;

  @ApiProperty({ required: false })
  latestApprovalAction: string | null;

  @ApiProperty({ required: false })
  ExternalId: string | null;

  @ApiProperty({ type: [Object] })
  ExpenseList: any[];

  @ApiProperty({ type: [Object] })
  expansionList: { outBoundField: string; actualValue: string | null }[];

  @ApiProperty()
  eventType: string;

  @ApiProperty({ required: false })
  EventSubType: string | null;

  @ApiProperty({ type: [EventSpeaker] })
  EventSpeakerList: EventSpeaker[];

  @ApiProperty()
  EventOwnerTimeZone: string;

  @ApiProperty()
  EventName: string;

  @ApiProperty()
  EventModifiedDateTime: string;

  @ApiProperty()
  EventId: string;

  @ApiProperty({ type: Object })
  EventBudget: {
    ModifiedDateTime: string;
    IntBudId: string | null;
    ExternalId: string;
    expansionList: { outBoundField: string; actualValue: string }[];
    EventId: string;
    BudgetName: string;
    BudExternalId: string;
  };

  @ApiProperty({ type: [Object] })
  EstimateList: any[];

  @ApiProperty()
  EstimatedAttendance: string;

  @ApiProperty()
  EndDateTime: string;

  @ApiProperty({ required: false })
  Description: string | null;

  @ApiProperty()
  countryCode: string;

  @ApiProperty({ required: false })
  CancellationRequestedDate: string | null;

  @ApiProperty({ required: false })
  CancellationRequested: string | null;

  @ApiProperty({ required: false })
  CancellationNotes: string | null;

  @ApiProperty({ type: [Attendee] })
  attendeeList: Attendee[];

  @ApiProperty()
  AhmPlanningStatus: string;
}
