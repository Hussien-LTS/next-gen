 
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
    expansionList:                      any[];
    EventId:                            string;
    Email:                              null;
    City:                               null;
    attendeeId:                         string;
    Address:                            null;
    accountExtId:                       string;
}