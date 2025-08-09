import {
    Entity,
    Column,
    PrimaryColumn,
    ManyToOne,
    JoinColumn,
  } from 'typeorm';
  import { User } from './user.entity';
  import { Territory } from './territory.entity';
  
  @Entity()
  export class UserTerritory {
    @PrimaryColumn()
    Id: string;
  
    @Column({ nullable: true })
    ModifiedDateTime: string;
  
    @Column({ nullable: true })
    ExternalId: string;
  
    @Column()
    ExternalUserId: string;
  
    @Column()
    ExternalTerritoryId: string;
  
    @Column({ nullable: true })
    ExternalParentTerritoryId: string;
  
    @Column({ nullable: true })
    Name: string;
  
    @ManyToOne(() => User)
    @JoinColumn({ name: 'ExternalUserId' })
    user: User;
  
    @ManyToOne(() => Territory)
    @JoinColumn({ name: 'ExternalTerritoryId' })
    territory: Territory;
  }
  