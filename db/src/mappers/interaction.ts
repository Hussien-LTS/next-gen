export interface Interaction {
    VenueState:                string;
    VenuePostalCode:           string;
    VenueName:                 string;
    VenueExternalId:           string;
    VenueCity:                 string;
    VenueAddressLine2:         null;
    VenueAddress:              string;
    transactionId:             string;
    TopicID:                   string;
    TeamMemberList:            TeamMemberList[];
    status:                    string;
    StartDateTime:             Date;
    ReconcilationStatus:       string;
    ParentEventId:             null;
    ownerId:                   string;
    latestApprovalCommentid:   null;
    latestApprovalComment:     null;
    latestApprovalAction:      null;
    ExternalId:                null;
    ExpenseList:               any[];
    expansionList:             ExpansionList[];
    eventType:                 string;
    EventSubType:              null;
    EventSpeakerList:          EventSpeakerList[];
    EventOwnerTimeZone:        string;
    EventName:                 string;
    EventModifiedDateTime:     Date;
    EventId:                   string;
    EventBudget:               EventBudget;
    EstimateList:              any[];
    EstimatedAttendance:       string;
    EndDateTime:               Date;
    Description:               null;
    countryCode:               string;
    CancellationRequestedDate: null;
    CancellationRequested:     null;
    CancellationNotes:         null;
    attendeeList:              AttendeeList[];
    AhmPlanningStatus:         string;
}

export interface EventBudget {
    ModifiedDateTime: Date;
    IntBudId:         null;
    ExternalId:       string;
    expansionList:    ExpansionList[];
    EventId:          string;
    BudgetName:       string;
    BudExternalId:    string;
}

export interface ExpansionList {
    outBoundField: string;
    actualValue:   null | string;
}

export interface EventSpeakerList {
    status:                             string;
    speakerId:                          string;
    speakerAccId:                       null;
    PreferenceOrder:                    string;
    Preference:                         string;
    ModifiedDateTime:                   Date;
    MealOptIn:                          string;
    InEligibleReasonAtTimeOfSubmission: null | string;
    InEligibleReasonAtTimeOfCreation:   null | string;
    InEligibleAtTimeOfSubmission:       string;
    InEligibleAtTimeOfCreation:         string;
    externalId:                         string;
    expansionList:                      ExpansionList[];
    EventId:                            string;
}

export interface TeamMemberList {
    userId:           string;
    teamMemberId:     string;
    role:             string;
    ModifiedDateTime: Date;
    isOwner:          null | string;
    ExternalId:       null;
    expansionList:    ExpansionList[];
    EventId:          string;
}

export interface AttendeeList {
    WalkInStatus:                       null;
    Title:                              null;
    status:                             string;
    ProfileType:                        null;
    PostalCode:                         null;
    Phone:                              null;
    ModifiedDateTime:                   Date;
    MealOptIn:                          string;
    LastName:                           string;
    InEligibleReasonAtTimeOfSubmission: null | string;
    InEligibleReasonAtTimeOfRSVP:       null;
    InEligibleReasonAtTimeOfCreation:   string;
    InEligibleReasonAtTimeOfAttendance: null;
    InEligibleAtTimeOfSubmission:       string;
    InEligibleAtTimeOfRSVP:             string;
    InEligibleAtTimeOfCreation:         string;
    InEligibleAtTimeOfAttendance:       string;
    FirstName:                          string;
    externalId:                         null;
    expansionList:                      ExpansionList[];
    EventId:                            string;
    Email:                              null;
    City:                               null;
    attendeeId:                         string;
    Address:                            null;
    accountExtId:                       string;
}
