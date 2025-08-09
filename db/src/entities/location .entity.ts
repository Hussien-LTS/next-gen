import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Event } from './event.entity';

@Entity()
export class Location {
  @PrimaryColumn()
  Id: string;

  @Column({ nullable: true })
  ModifiedDateTime: string;

  @Column({ nullable: true })
  ExternalId: string;

  @Column({ nullable: true })
  EventId: string;

  @Column({ nullable: true })
  AccountId: string;

  @Column({ nullable: true })
  Location_Name: string;

  @Column({ nullable: true })
  Location_Status: string;

  @Column({ nullable: true })
  Location_Priority: string;

  @Column({ nullable: true })
  Preference_Order: string;

  @Column({ nullable: true })
  Room_Set_Up: string;

  @Column({ nullable: true })
  Handicap_Accessible: string;

  @Column({ nullable: true })
  Reservation_Made: string;

  @Column({ nullable: true })
  Phone_Number: string;

  @Column({ nullable: true })
  Address_Line_1: string;

  @Column({ nullable: true })
  Address_Line_2: string;

  @Column({ nullable: true })
  City: string;

  @Column({ nullable: true })
  State_Province: string;

  @Column({ nullable: true })
  Zip: string;

  @Column({ nullable: true })
  Reservation_Name: string;

  @ManyToOne(() => Event, { nullable: true })
  @JoinColumn({ name: 'EventId' })
  Event?: Event;
}
