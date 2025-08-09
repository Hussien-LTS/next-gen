import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class HCPEligibility {
  @PrimaryGeneratedColumn()
  Id: string;

  @Column({ nullable: true })
  ModifiedDateTime: string;

  @Column({ nullable: true })
  ExternalId: string;

  @Column({ nullable: true })
  StartDate: string;

  @Column({ nullable: true })
  EndDate: string;

  @Column({ nullable: true })
  Region: string;

  @Column({ nullable: true })
  ExternalSpeakerId: string;

  @Column({ nullable: true })
  Status: string;

  @Column({ nullable: true })
  EventSubType: string;

  @Column({ nullable: true })
  EventType: string;

  @Column()
  EventId: string;

  @Column({ nullable: true })
  Topic: string;

  @Column({ nullable: true })
  Role: string;

  @Column({ nullable: true })
  DurationType: string;

  @Column({ nullable: true })
  TravelType: string;

  @Column({ nullable: true })
  SpendType: string;

  @Column({ type: 'simple-array', nullable: true })
  EligibilityReason: string[];
}
