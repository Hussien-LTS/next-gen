import { ApiProperty } from "@nestjs/swagger"



 class TopicList {
    @ApiProperty({ description: 'Vault API authorization token' })
    TopicType: string

    @ApiProperty({ description: 'Vault API authorization token' })
    TopicID: string
    @ApiProperty({ description: 'Vault API authorization token' })
    TopicDescription: string
    @ApiProperty({ description: 'Vault API authorization token' })
    ExternalId: string
}


export class AddUpdateTopicInfoModel {
    @ApiProperty({ description: 'Vault API authorization token' })

    TransactionId: string

@ApiProperty({ type: [TopicList] })
    topicList: TopicList[]
}

 