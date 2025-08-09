import { Entity, PrimaryColumn, OneToMany } from 'typeorm';
import { TopicSalesforce } from './topic-salesforce.entity';

@Entity()
export class TopicTransaction {
  @PrimaryColumn()
  TransactionId: string;

  @OneToMany(() => TopicSalesforce, (topic) => topic.transaction, {
    cascade: true,
  })
  topicList: TopicSalesforce[];
}
