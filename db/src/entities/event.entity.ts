import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity()
export class Event {
  @PrimaryColumn({ type: 'nvarchar', length: 255 })
  Id: string;
  @Column({ nullable: true })
  EventModifiedDateTime: string;

  @Column({ nullable: true })
  ExternalId: string;

  @Column({ nullable: true })
  ParentEventId: string;

  @Column({ nullable: true, type: 'nvarchar', length: 1000 })
  Program_Name: string;

  @Column({ nullable: true })
  OwnerID: string;

  @Column({ nullable: true })
  End_date: string;

  @Column({ nullable: true })
  End_Time: string;

  @Column({ nullable: true })
  Hosting_Region: string;

  @Column({ nullable: true })
  Event_Category: string;

  @Column({ nullable: true })
  Event_Category_Group: string;

  @Column({ nullable: true })
  Event_Type: string;

  @Column({ nullable: true })
  Location_Type: string;

  @Column({ nullable: true })
  Master_id: string;

  @Column({ nullable: true })
  Primary_Collaborator: string;

  @Column({ nullable: true })
  Primary_Organization_Unit: string;

  @Column({ nullable: true })
  Region: string;

  @Column({ nullable: true, type: 'nvarchar', length: 255 })
  Start_date: string;

  @Column({ nullable: true, type: 'nvarchar', length: 255 })
  Start_Time: string;

  @Column({ nullable: true })
  Status: string;

  @Column({ nullable: true })
  Current_Status: string;

  @Column({ nullable: true })
  Time_Zone: string;

  @Column({ nullable: true })
  Description: string;

  @Column({ nullable: true })
  Total_Estimated_Number_of_Participants: string;

  @Column({ nullable: true })
  AttachmentExists: string;

  @Column({ nullable: true })
  EventSubType: string;

  @Column({
    type: 'nvarchar',
    nullable: true,
    length: 'MAX',
    transformer: {
      to: (value: any) => JSON.stringify(value),
      from: (value: string) => {
        try {
          return JSON.parse(value);
        } catch {
          return null;
        }
      },
    },
  })
  expansionList: Record<string, any>;

  //   @ManyToOne(() => ParentEvent, { nullable: true })
  //   @JoinColumn({ name: 'ParentEventId' })
  //   ParentEvent?: ParentEvent;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'OwnerID' })
  Owner?: User;
}