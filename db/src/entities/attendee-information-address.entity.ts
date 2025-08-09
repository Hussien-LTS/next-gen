import { Entity, PrimaryColumn, ManyToOne, Column, JoinColumn } from 'typeorm';
import { AttendeeInformation } from './attendee-information.entity';

@Entity()
export class AttendeeInformationAddress {
  @PrimaryColumn()
  Id: string;

  @Column({ unique: true, nullable: true })
  ExternalId: string;

  @Column({ nullable: true })
  SerialNo: string;

  @Column({ nullable: true })
  AddressLine1: string;

  @Column({ nullable: true })
  AddressLine2: string;

  @Column({ nullable: true })
  City: string;

  @Column({ nullable: true })
  State: string;

  @Column({ nullable: true })
  Country: string;

  @Column({ nullable: true })
  ZipCode: string;

  @ManyToOne(() => AttendeeInformation, (Attendee) => Attendee.Addresses, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'AttendeeInformationId' })
  Attendee?: AttendeeInformation[];
}
