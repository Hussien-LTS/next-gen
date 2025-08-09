import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity({ name: 'User' })
export class User {
  @PrimaryColumn()
  Id: string;

  @Column({ nullable: true })
  ModifiedDateTime: string;

  @Column({ nullable: true })
  ExternalId: string;

  @Column({ nullable: true })
  UserStatus: string;

  @Column({ nullable: true })
  Alias: string;

  @Column({ nullable: true })
  TimeZoneSidKey: string;

  @Column({ nullable: true })
  LocaleSidKey: string;

  @Column({ nullable: true })
  EmailEncodingKey: string;

  @Column({ nullable: true })
  LanguageLocaleKey: string;

  @Column({ nullable: true })
  UserName: string;

  @Column({ nullable: true })
  UserEmail: string;

  @Column({ nullable: true })
  HomeAddressLine1: string;

  @Column({ nullable: true })
  HomeCountry: string;

  @Column({ nullable: true })
  HomeCity: string;

  @Column({ nullable: true })
  HomeState: string;

  @Column({ nullable: true })
  HomePostalCode: string;

  @Column({ nullable: true })
  UserFirstName: string;

  @Column({ nullable: true })
  UserLastName: string;

  @Column({ nullable: true })
  AssignmentPosition: string;
}
