import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('AttendeeValidation')
export class AttendeeValidation {
  @PrimaryGeneratedColumn('uuid')
  Id: string;

  @Column({ type: 'text', nullable: true })
  TransactionId: string;

  @Column({ type: 'text', nullable: true })
  AttendeeId: string;

  @Column({ type: 'text', nullable: true })
  EventId: string;

  @Column({ type: 'text', nullable: true })
  AccountId: string;

  @Column({ type: 'text', nullable: true })
  AccountExternalId: string;

  @Column({ type: 'text', nullable: true })
  EventCountry: string;

  @Column({ type: 'text', nullable: true })
  EventStatus: string;

  @Column({ type: 'text', nullable: true })
  EventStartDate: string;

  @Column({ type: 'text', nullable: true })
  EventEndDate: string;

  @Column({ type: 'text', nullable: true })
  EventTopic: string;

  @Column({ type: 'text', nullable: true })
  ObjectType: string;

  @Column({ type: 'text', nullable: true })
  ValidationStatus: string;

  @Column({ type: 'text', nullable: true })
  CentrisResponse: string;

  @Column({ type: 'text', nullable: true })
  ErrorMessage: string;

  @Column({ type: 'text', nullable: true })
  CreatedDateTime: string;

  @Column({ type: 'text', nullable: true })
  ModifiedDateTime: string;
} 