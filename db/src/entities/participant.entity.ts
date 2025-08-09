import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Topic } from './topic.entity';
import { Event } from './event.entity'
@Entity()
export class Participant {
    @PrimaryColumn()
    Id: string;

    @Column({ nullable: true })
    ModifiedDateTime: string;

    @Column({ nullable: true })
    ExternalId: string;

    @Column({ nullable: true })
    FirstName: string;

    @Column({ nullable: true })
    LastName: string;

    @Column({ nullable: true })
    Title: string;

    @Column({ nullable: true })
    City: string;

    @Column({ nullable: true })
    PostalCode: string;

    @Column({ nullable: true })
    Phone: string;

    @Column({ nullable: true })
    Email: string;

    @Column({ nullable: true })
    Address: string;

    @Column({ nullable: true })
    ProfileType: string;

    @Column({ nullable: true })
    EventId: string;

    @Column({ nullable: true })
    Preference: string;

    @Column({ nullable: true })
    PreferenceOrder: string;

    @Column({ nullable: true })
    HCPId: string;

    @Column({ nullable: true })
    EmployedId: string;

    @Column({ nullable: true })
    TopicId: string;

    @Column({ nullable: true })
    Type: string;

    @Column({ nullable: true })
    Role: string;

    @Column({ nullable: true })
    ProductId: string;

    @Column({ nullable: true })
    Status: string;

    @Column({ nullable: true })
    MealConsumed: string;

    @Column({ nullable: true })
    RSVPStatus: string;

    @Column({ nullable: true })
    DidAttend: string;

    @Column({ nullable: true })
    WalkInStatus: string;

    @ManyToOne(() => Event, { nullable: true })
    @JoinColumn({ name: 'EventId' })
    Event?: Event;

    @ManyToOne(() => Topic, { nullable: true })
    @JoinColumn({ name: 'TopicId' })
    Topic?: Topic;
}
