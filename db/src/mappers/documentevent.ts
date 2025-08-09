export interface DocumentEvent {
    responseStatus: string
    events: Event[]
  }
  
  export interface Event {
    name: string
    label: string
    subtypes: Subtype[]
  }
  
  export interface Subtype {
    name: string
    label: string
    value: string
  }
  