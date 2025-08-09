export interface Territory {
    transactionId: string;
    terDataList:   TerDataList[];
}

export interface TerDataList {
    parentMstrId: string;
    name:         string;
    masterId:     string;
}
