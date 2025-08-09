import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity()
export class Attachment {
  @PrimaryColumn()
  Id: string;

  @Column({ nullable: true })
  ModifiedDateTime: string;

  @Column({ nullable: true })
  ExternalId: string;

  @Column({ nullable: true })
  Body: string;

  @Column({ nullable: true })
  BodyLength: string;

  @Column({ nullable: true })
  ContentType: string;

  @Column({ nullable: true })
  Name: string;

  @Column({ nullable: true })
  ExternalRecordId: string;

  @Column({ nullable: true })
  ExternalRecordName: string;
}
