export interface SpeakerQualification {
    TransactionId: string;
    HCPDataList:   HCPDataList[];
}

export interface HCPDataList {
    trainingList:  any[];
    SpeakerStatus: string;
    SpeakerLName:  string;
    SpeakerId:     string;
    SpeakerFName:  string;
    SpeakerAddr:   string;
    contractList:  ContractList[];
}

export interface ContractList {
    status:           string;
    StartDate:        Date;
    MasterId:         string;
    EndDate:          Date;
    ContractTypeName: string;
    ContractTypeId:   string;
    ContractName:     string;
}
