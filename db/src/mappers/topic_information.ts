export interface TopicInformation {
    TransactionId: string;
    topicList:     TopicList[];
}

export interface TopicList {
    TopicType:        string;
    TopicID:          string;
    TopicDescription: string;
    ExternalId:       string;
}
