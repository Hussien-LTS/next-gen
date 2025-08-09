import { AttendeeList } from "./attendeelist"
import { EstimateList } from "./estimatelist"
import { EventBudget } from "./eventbudget"
  import { ExpenseList } from "./expenselist"
import { TeamMemberList } from "./teammemberList"
 
 
export interface Root {
    VenueState: string
    VenuePostalCode: string
    VenueName: string
    VenueExternalId: any
    VenueCity: string
    VenueAddressLine2: any
    VenueAddress: string
    transactionId: string
    TopicID: string
    TeamMemberList: TeamMemberList[]
    status: string
    StartTimeLocal: string
    StartDateTime: string
    StartDateLocal: string
    ReconcilationStatus: string
    PlannerApprovalNotRequired: string
    ParentEventId: string
    ownerId: string
    latestApprovalCommentid: any
    latestApprovalComment: any
    latestApprovalAction: any
    IsVeevaSFDCAutoflow: string
    ExternalId: string
    ExpenseList: ExpenseList[]
    expansionList: any[]
    eventType: string
    EventTimeZoneLocal: string
    EventSubType: string
    EventSpeakerList: any[]
    EventOwnerTimeZone: string
    EventName: string
    EventModifiedDateTime: string
    EventId: string
    EventBudget: EventBudget
    EstimateList: EstimateList[]
    EstimatedAttendance: string
    EndTimeLocal: string
    EndDateTime: string
    EndDateLocal: string
    Description: string
    deletedAttendeeList: AttendeeList[]
    countryCode: string
    CancellationRequestedDate: any
    CancellationRequested: any
    CancellationNotes: any
    AutoApprovalNotRequired: string
    attendeeList: AttendeeList[]
    AttachmentExists: string
    AhmPlanningStatus: string,
    
  }