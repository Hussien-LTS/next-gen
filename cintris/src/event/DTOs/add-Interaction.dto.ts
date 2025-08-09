import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class ExpansionItemDto {
  @ApiProperty()
  outBoundField: string;

  @ApiPropertyOptional()
  actualValue: any;
}

class TeamMemberDto {
  @ApiPropertyOptional()
  userId: string | null;

  @ApiProperty()
  teamMemberId: string;

  @ApiProperty()
  role: string;

  @ApiProperty()
  ModifiedDateTime: string;

  @ApiPropertyOptional()
  isOwner: string | null;

  @ApiPropertyOptional()
  ExternalId: string | null;

  @ApiProperty({ type: [ExpansionItemDto] })
  expansionList: ExpansionItemDto[];

  @ApiProperty()
  EventId: string;
}

class EventSpeakerDto {
  @ApiProperty()
  status: string;

  @ApiProperty()
  speakerId: string;

  @ApiPropertyOptional()
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
  InEligibleReasonAtTimeOfSubmission: string;

  @ApiProperty()
  InEligibleReasonAtTimeOfCreation: string;

  @ApiProperty()
  InEligibleAtTimeOfSubmission: string;

  @ApiProperty()
  InEligibleAtTimeOfCreation: string;

  @ApiProperty()
  externalId: string;

  @ApiProperty({ type: [ExpansionItemDto] })
  expansionList: ExpansionItemDto[];

  @ApiProperty()
  EventId: string;
}

class EventBudgetDto {
  @ApiProperty()
  ModifiedDateTime: string;

  @ApiPropertyOptional()
  IntBudId: string | null;

  @ApiProperty()
  ExternalId: string;

  @ApiProperty({ type: [ExpansionItemDto] })
  expansionList: ExpansionItemDto[];

  @ApiProperty()
  EventId: string;

  @ApiProperty()
  BudgetName: string;

  @ApiProperty()
  BudExternalId: string;
}

class EstimateDto {
  @ApiProperty()
  ModifiedDateTime: string;

  @ApiProperty()
  IntBudId: string;

  @ApiPropertyOptional()
  ExternalId: string | null;

  @ApiProperty()
  ExpenseType: string;

  @ApiProperty({ type: [ExpansionItemDto] })
  expansionList: ExpansionItemDto[];

  @ApiProperty()
  EventId: string;

  @ApiPropertyOptional()
  EventBudgetId: string | null;

  @ApiProperty()
  EstimateId: string;

  @ApiProperty()
  EstimateAmount: string;
}

export class VeevaEventDto {
  @ApiProperty()
  VenueState: string;

  @ApiProperty()
  VenuePostalCode: string;

  @ApiProperty()
  VenueName: string;

  @ApiPropertyOptional()
  VenueExternalId: string | null;

  @ApiProperty()
  VenueCity: string;

  @ApiPropertyOptional()
  VenueAddressLine2: string | null;

  @ApiProperty()
  VenueAddress: string;

  @ApiProperty()
  transactionId: string;

  @ApiProperty()
  TopicID: string;

  @ApiProperty({ type: [TeamMemberDto] })
  TeamMemberList: TeamMemberDto[];

  @ApiProperty()
  status: string;

  @ApiProperty()
  StartTimeLocal: string;

  @ApiProperty()
  StartDateTime: string;

  @ApiProperty()
  StartDateLocal: string;

  @ApiProperty()
  ReconcilationStatus: string;

  @ApiProperty()
  PlannerApprovalNotRequired: string;

  @ApiPropertyOptional()
  ParentEventId: string | null;

  @ApiProperty()
  OwnerID: string;

  @ApiPropertyOptional()
  latestApprovalCommentid: string | null;

  @ApiPropertyOptional()
  latestApprovalComment: string | null;

  @ApiPropertyOptional()
  latestApprovalAction: string | null;

  @ApiProperty()
  IsVeevaSFDCAutoflow: string;

  @ApiPropertyOptional()
  ExternalId: string | null;

  @ApiProperty({ type: Array })
  ExpenseList: any[];

  @ApiProperty({ type: [ExpansionItemDto] })
  expansionList: ExpansionItemDto[];

  @ApiProperty()
  eventType: string;

  @ApiProperty()
  EventTimeZoneLocal: string;

  @ApiProperty()
  EventSubType: string;

  @ApiProperty({ type: [EventSpeakerDto] })
  EventSpeakerList: EventSpeakerDto[];

  @ApiPropertyOptional()
  EventOwnerTimeZone: string | null;

  @ApiProperty()
  EventName: string;

  @ApiProperty()
  EventModifiedDateTime: string;

  @ApiProperty()
  EventId: string;

  @ApiPropertyOptional({ type: EventBudgetDto })
  EventBudget: EventBudgetDto | null;

  @ApiProperty({ type: [EstimateDto] })
  EstimateList: EstimateDto[];

  @ApiProperty()
  EstimatedAttendance: string;

  @ApiProperty()
  EndTimeLocal: string;

  @ApiProperty()
  EndDateTime: string;

  @ApiProperty()
  EndDateLocal: string;

  @ApiProperty()
  Description: string;

  @ApiProperty({ type: Array })
  deletedAttendeeList: any[];

  @ApiProperty()
  countryCode: string;

  @ApiPropertyOptional()
  CancellationRequestedDate: string | null;

  @ApiPropertyOptional()
  CancellationRequested: string | null;

  @ApiPropertyOptional()
  CancellationNotes: string | null;

  @ApiProperty()
  AutoApprovalNotRequired: string;

  @ApiProperty({ type: Array })
  attendeeList: any[];

  @ApiProperty()
  AttachmentExists: string;

  @ApiPropertyOptional()
  AhmPlanningStatus: string | null;
}

export class VeevaEventWrapperDto {
  @ApiProperty({ type: [VeevaEventDto] })
  veevaEvent: VeevaEventDto[];
}
