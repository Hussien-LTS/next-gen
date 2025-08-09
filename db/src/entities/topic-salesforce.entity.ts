/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { TopicTransaction } from './topic-salesforce-transaction.entity';

@Entity()
export class TopicSalesforce {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  TopicType: string;

  @Column()
  TopicID: string;

  @Column()
  TopicDescription: string;

  @Column()
  ExternalId: string;

 @Column({
  type: 'nvarchar',
  nullable: true,
  transformer: {
    to: (value: any) => JSON.stringify(value),
    from: (value: string) => {
      try {
        return JSON.parse(value);
      } catch {
        return null;
      }
    },
  },
})
expansionList: Record<string, any>;

  @ManyToOne(() => TopicTransaction, (transaction) => transaction.topicList, {
    onDelete: 'CASCADE',
  })
  transaction: TopicTransaction;
}
