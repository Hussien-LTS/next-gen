import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Event } from './event.entity';
import { Topic } from './topic.entity';

@Entity()
export class EventProductTopic {
  @PrimaryColumn()
  Id: string;

  @Column({ nullable: true })
  ModifiedDateTime: string;

  @Column({ nullable: true })
  ExternalId: string;

  @Column({ nullable: true })
  EventId: string;

  @Column({ nullable: true })
  TopicId: string;

  @ManyToOne(() => Event, { nullable: true })
  @JoinColumn({ name: 'EventId' })
  Event?: Event;

  @ManyToOne(() => Topic, { nullable: true })
  @JoinColumn({ name: 'TopicId' })
  Topic?: Topic;
}
