import { Entity, Column, PrimaryColumn, OneToMany } from 'typeorm';
import { AttendeeInformationAddress } from './attendee-information-address.entity';

@Entity()
export class AttendeeInformation {
  @PrimaryColumn()
  Id: string;

  @Column({ unique: true, nullable: true })
  ExternalId: string;

  @Column({ nullable: true })
  Name: string;

  @Column({ nullable: true })
  FirstName: string;

  @Column({ nullable: true })
  LastName: string;

  @Column({ nullable: true })
  Salutation: string;

  @Column({ nullable: true })
  Phone: string;

  @Column({ nullable: true })
  Email: string;

  @Column({ nullable: true })
  Credential: string;

  @Column({ nullable: true })
  Speciality: string;

  @OneToMany(() => AttendeeInformationAddress, (Address) => Address.Attendee, {
    cascade: true,
    nullable: true,
  })
  Addresses?: AttendeeInformationAddress[];
}
