import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Event } from './event.entity';

@Entity()
export class Estimate {
  @PrimaryColumn()
  Id: string;

  @Column({ nullable: true })
  ModifiedDateTime: string;

  @Column({ nullable: true })
  ExternalId: string;

  @Column({ nullable: true })
  EventId: string;

  @Column({ nullable: true })
  Amount: string;

  @Column({ nullable: true })
  SpendType: string;

  @Column({ nullable: true })
  ExternalBudgetId: string;

  @ManyToOne(() => Event, { nullable: true })
  @JoinColumn({ name: 'EventId' })
  Event?: Event;
}
