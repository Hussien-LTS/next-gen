import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('attachment_ids')
export class AttachmentIds {
  @PrimaryColumn()
  Id: string;

  @Column('simple-array')
  AttachmentIdList: string[];
}