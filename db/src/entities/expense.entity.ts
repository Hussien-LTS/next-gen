import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Event } from './event.entity';

@Entity()
export class Expense {
  @PrimaryColumn()
  Id: string;

  @Column({ nullable: true })
  ModifiedDateTime: string;

  @Column({ nullable: true })
  ExternalId: string;

  @Column({ nullable: true })
  ExpenseHeaderId: string;

  @Column({ nullable: true })
  EventId: string;

  @Column({ nullable: true })
  Actual: string;

  @Column({ nullable: true })
  SpendType: string;

  @Column({ nullable: true })
  Status: string;

  @Column({ nullable: true })
  ExternalBudgetId: string;

  @Column({ nullable: true })
  InvExternalId: string;

  @Column({ nullable: true })
  AttendeExternalId: string;

  @Column({ nullable: true })
  SpeakerExternalId: string;

  @Column({ nullable: true })
  PayeeDate: string;

  @Column({ nullable: true })
  ExpenseDate: string;

  @Column({ nullable: true })
  EstimateExternalId: string;

  @ManyToOne(() => Event, { nullable: true })
  @JoinColumn({ name: 'EventId' })
  Event?: Event;
}
