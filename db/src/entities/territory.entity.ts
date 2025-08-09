import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class Territory {
  @PrimaryColumn({ type: 'varchar', length: 255 })
  Id: string;

  @Column({ type: 'varchar', nullable: true })
  ModifiedDateTime: string;

  @Column({ type: 'varchar', nullable: true })
  ExternalId: string;

  @Column({ type: 'varchar', nullable: true })
  ExternalParentId: string;

  @Column({ type: 'varchar', nullable: true })
  Name: string;
}