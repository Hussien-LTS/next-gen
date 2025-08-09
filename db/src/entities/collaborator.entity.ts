import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Event } from './event.entity';

@Entity()
export class Collaborator {
  @PrimaryColumn()
  Id: string;

  @Column({ nullable: true })
  ModifiedDateTime: string;

  @Column({ nullable: true })
  ExternalId: string;

  @Column({ nullable: true })
  EventId: string;

  @Column({ nullable: true })
  ExternalEmployedId: string;

  @Column({ nullable: true })
  Role: string;

  @Column({ nullable: true })
  isOwner: string;

  @ManyToOne(() => Event, { nullable: true })
  @JoinColumn({ name: 'EventId' })
  Event?: Event;
}
