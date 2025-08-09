export interface UserTerritory {
    UserTerrWrapperList: UserTerrWrapperList[];
    transactionId:       string;
}

export interface UserTerrWrapperList {
    userInfoList:   UserInfoList[];
    userIdList:     string[];
    terrName:       string;
    terrMasterId:   string;
    parentMasterId: string;
}

export interface UserInfoList {
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
    assignmentPosition: string;
}
