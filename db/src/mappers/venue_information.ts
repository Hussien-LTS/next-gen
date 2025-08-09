export interface VenueInformation {
    VenueList:     VenueList[];
    TransactionId: string;
}

export interface VenueList {
    VenueName:    string;
    Status:       string;
    State:        string;
    PostalCode:   string;
    ExternalId:   string;
    City:         string;
    AddressLine2: null;
    AddressLine1: string;
}
