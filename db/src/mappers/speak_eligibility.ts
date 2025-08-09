export interface SpeakEligibility {
    speakerinformation: Speakerinformation
  }
  
  export interface Speakerinformation {
    transactionId: string
    startdate: string
    enddate: string
    region: string
    hcpId: string[]
    EventSpeakerId: string[]
    status: string
    InteractionType: string
    "InteractionId ": string
    topic: string
    getData: string
    role: string
    Durationtype: any
    TravelType: any
    SpendType: any
  }
  