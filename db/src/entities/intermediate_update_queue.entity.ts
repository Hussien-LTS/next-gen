import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity()
export class IntermediateUpdateQueue {
  @PrimaryColumn()
  Id: string;

  @Column({ nullable: true })
  ModifiedDateTime: string;

  @Column({ nullable: true })
  Name: string;

  @Column({ nullable: true })
  RecordId: string;

  @Column({ nullable: true })
  Type: string;
}
