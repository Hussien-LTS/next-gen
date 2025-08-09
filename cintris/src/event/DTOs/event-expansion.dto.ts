import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsString, IsOptional, IsArray, ValidateNested } from 'class-validator';

export class VeevaEventDto {
  @ApiProperty({ example: 'New Jersey' })
  @IsString()
  VenueState: string;

  @ApiProperty({ example: '08536' })
  @IsString()
  VenuePostalCode: string;

  @ApiProperty({ example: 'V8BZ025E829MT9U' })
  @IsString()
  VenueName: string;

  @ApiProperty({ example: 'AHM_SP10406' })
  @IsString()
  VenueExternalId: string;

  @ApiProperty({ example: 'Plainsboro' })
  @IsString()
  VenueCity: string;

  @ApiPropertyOptional({ example: null })
  @IsOptional()
  VenueAddressLine2: string | null;

  @ApiProperty({ example: '1800 North Point Drive' })
  @IsString()
  VenueAddress: string;

  @ApiProperty({ example: 'a12aZ0000003X97QAE' })
  @IsString()
  transactionId: string;

  @ApiProperty({ example: 'AHM_TOP_0671' })
  @IsString()
  TopicID: string;

  @ApiProperty({
    example: [
      {
        userId: 'Andrews, Kimberly',
        teamMemberId: 'V84Z08LKW9CEJV9',
        role: 'team_member',
        ModifiedDateTime: '2025-06-16 22:37:02',
        isOwner: null,
        ExternalId: 'Andrews, Kimberly',
        expansionList: [],
        EventId: 'a12aZ0000003X97QAE',
      },
    ],
  })
  @IsArray()
  TeamMemberList: Array<{
    userId: string;
    teamMemberId: string;
    role: string;
    ModifiedDateTime: string;
    isOwner: boolean | null;
    ExternalId: string;
    expansionList: Array<{
      outBoundField: string;
      actualValue: any;
    }>;
    EventId: string;
  }>;

  @ApiProperty({ example: 'active__v' })
  @IsString()
  status: string;

  @ApiPropertyOptional({ example: null })
  @IsOptional()
  StartTimeLocal: string | null;

  @ApiProperty({ example: '2024-12-14 15:20:00' })
  @IsString()
  StartDateTime: string;

  @ApiProperty({ example: '2024-12-14' })
  @IsString()
  StartDateLocal: string;

  @ApiProperty({ example: 'false' })
  @IsString()
  ReconcilationStatus: string;

  @ApiProperty({ example: 'false' })
  @IsString()
  PlannerApprovalNotRequired: string;

  @ApiPropertyOptional({ example: null })
  @IsOptional()
  ParentEventId: string | null;

  @ApiProperty({ example: '23459569' })
  @IsString()
  OwnerID: string;

  @ApiPropertyOptional({ example: null })
  @IsOptional()
  latestApprovalCommentid: string | null;

  @ApiPropertyOptional({ example: null })
  @IsOptional()
  latestApprovalComment: string | null;

  @ApiPropertyOptional({ example: null })
  @IsOptional()
  latestApprovalAction: string | null;

  @ApiProperty({ example: 'false' })
  @IsString()
  IsVeevaSFDCAutoflow: string;

  @ApiPropertyOptional({ example: null })
  @IsOptional()
  ExternalId: string | null;

  @ApiProperty({ example: [] })
  @IsArray()
  ExpenseList: any[];

  @ApiProperty({
    example: [
      {
        outBoundField: 'Catering_Notes__c',
        actualValue: null,
      },
    ],
  })
  @IsArray()
  expansionList: Array<{
    outBoundField: string;
    actualValue: any;
  }>;

  @ApiProperty({ example: 'Unknown' })
  @IsString()
  eventType: string;

  @ApiProperty({ example: 'America/New_York' })
  @IsString()
  EventTimeZoneLocal: string;

  @ApiProperty({ example: 'Unknown' })
  @IsString()
  EventSubType: string;

  @ApiProperty({
    example: [
      {
        status: 'active__v',
        speakerId: 'V83Z08LKW8PTFHP',
        speakerAccId: null,
        PreferenceOrder: '1',
        Preference: 'Preferred',
        ModifiedDateTime: '2025-06-16 22:37:02',
        MealOptIn: 'false',
        InEligibleReasonAtTimeOfSubmission:
          'Processing Complete with ineligibilities Invalid Topic',
        InEligibleReasonAtTimeOfCreation:
          'Processing Complete with ineligibilities Invalid Topic',
        InEligibleAtTimeOfSubmission: 'true',
        InEligibleAtTimeOfCreation: 'true',
        externalId: 'ESP-0000306926',
        expansionList: [],
        EventId: 'a12aZ0000003X97QAE',
      },
    ],
  })
  @IsArray()
  EventSpeakerList: Array<{
    status: string;
    speakerId: string;
    speakerAccId: string | null;
    PreferenceOrder: string;
    Preference: string;
    ModifiedDateTime: string;
    MealOptIn: string;
    InEligibleReasonAtTimeOfSubmission: string;
    InEligibleReasonAtTimeOfCreation: string;
    InEligibleAtTimeOfSubmission: string;
    InEligibleAtTimeOfCreation: string;
    externalId: string;
    expansionList: Array<{
      outBoundField: string;
      actualValue: any;
    }>;
    EventId: string;
  }>;

  @ApiProperty({ example: 'America/New_York' })
  @IsString()
  EventOwnerTimeZone: string;

  @ApiProperty({
    example: 'Ashfield HO_Product Theater RYBELSUS_NACE_December 14',
  })
  @IsString()
  EventName: string;

  @ApiProperty({ example: '2025-06-16 22:37:02' })
  @IsString()
  EventModifiedDateTime: string;

  @ApiProperty({ example: 'a12aZ0000003X97QAE' })
  @IsString()
  EventId: string;

  @ApiPropertyOptional({
    example: {
      ModifiedDateTime: '2025-06-16 22:37:02',
      IntBudId: 'a2lOy000002U6ZtIAK',
      ExternalId: 'V8IZ08LKW8WEBNO',
      expansionList: [],
      EventId: 'a12aZ0000003X97QAE',
      BudgetName: 'EH-0000370996',
      BudExternalId: 'AHM_BUD_00190-SCBDF000',
    },
  })
  @IsOptional()
  EventBudget?: {
    ModifiedDateTime: string;
    IntBudId: string;
    ExternalId: string;
    expansionList: Array<{
      outBoundField: string;
      actualValue: any;
    }>;
    EventId: string;
    BudgetName: string;
    BudExternalId: string;
  };

  @ApiProperty({
    example: [
      {
        ModifiedDateTime: '2025-06-16 22:37:02',
        IntBudId: 'a2lOy000002U6ZtIAK',
        ExternalId: null,
        ExpenseType: 'General',
        expansionList: [],
        EventId: 'V7RZ08LKW9127PP',
        EventBudgetId: null,
        EstimateId: 'V85Z08LKWEN2ZXH',
        EstimateAmount: '663',
      },
    ],
  })
  @IsArray()
  EstimateList: Array<{
    ModifiedDateTime: string;
    IntBudId: string;
    ExternalId: string | null;
    ExpenseType: string;
    expansionList: Array<{
      outBoundField: string;
      actualValue: any;
    }>;
    EventId: string;
    EventBudgetId: string | null;
    EstimateId: string;
    EstimateAmount: string;
  }>;

  @ApiProperty({ example: '350' })
  @IsString()
  EstimatedAttendance: string;

  @ApiProperty({ example: '13:00:00.000Z' })
  @IsString()
  EndTimeLocal: string;

  @ApiProperty({ example: '2024-12-14 16:20:00' })
  @IsString()
  EndDateTime: string;

  @ApiProperty({ example: '2024-12-14' })
  @IsString()
  EndDateLocal: string;

  @ApiProperty({ example: '80336 (Home Office Product Theater)' })
  @IsString()
  Description: string;

  @ApiProperty({ example: [] })
  @IsArray()
  deletedAttendeeList: any[];

  @ApiProperty({ example: 'US' })
  @IsString()
  countryCode: string;

  @ApiPropertyOptional({ example: null })
  @IsOptional()
  CancellationRequestedDate: string | null;

  @ApiPropertyOptional({ example: null })
  @IsOptional()
  CancellationRequested: string | null;

  @ApiPropertyOptional({ example: null })
  @IsOptional()
  CancellationNotes: string | null;

  @ApiProperty({ example: 'false' })
  @IsString()
  AutoApprovalNotRequired: string;

  @ApiProperty({
    example: [
      {
        attendeeId: 'V8FZ08LKWAAWID2',
        status: 'active__v',
        ModifiedDateTime: '2025-06-16 22:37:02',
        ExternalId: 'A002926007',
        expansionList: [],
        EventId: 'a12aZ0000003X97QAE',
      },
    ],
  })
  @IsArray()
  attendeeList: Array<{
    attendeeId: string;
    status: string;
    ModifiedDateTime: string;
    ExternalId: string;
    expansionList: Array<{
      outBoundField: string;
      actualValue: any;
    }>;
    EventId: string;
  }>;

  @ApiProperty({ example: 'false' })
  @IsString()
  AttachmentExists: string;

  @ApiProperty({ example: 'completed__c' })
  @IsString()
  AhmPlanningStatus: string;
}

// Root DTO for the entire payload
export class EventPayloadDto {
  @ApiProperty({
    description: 'Array of Veeva events',
    type: [VeevaEventDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VeevaEventDto)
  veevaEvent: VeevaEventDto[];
}