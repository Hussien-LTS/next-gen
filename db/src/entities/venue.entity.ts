import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Venue {
  @PrimaryGeneratedColumn()
  Id: string;

  @Column({ nullable: true })
  ModifiedDateTime: string;

  @Column({ nullable: true })
  ExternalId: string;

  @Column({ nullable: true })
  Name: string;

  @Column({ nullable: true })
  Status: string;

  @Column({ nullable: true })
  AddressLine1: string;

  @Column({ nullable: true })
  AddressLine2: string;

  @Column({ nullable: true })
  City: string;

  @Column({ nullable: true })
  State: string;

  @Column({ nullable: true })
  PostalCode: string;

  @Column({ default: 'centries' })
  Source: string;

  @Column({ nullable: true })
  ExpansionList: string;
}
