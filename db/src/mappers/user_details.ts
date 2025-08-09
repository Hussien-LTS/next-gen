export interface UserDetails {
    userDataList:  UserDataList[];
    transactionId: string;
}

export interface UserDataList {
    userStatus:         boolean;
    userRole:           string;
    userProfile:        string;
    userLastName:       string;
    userIdentifierId:   string;
    userFirstName:      string;
    homeState:          string;
    homePostalCode:     string;
    homeCountry:        string;
    homeAddressLine1:   string;
    assignmentPosition: null;
}
