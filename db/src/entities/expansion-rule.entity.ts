import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { ConfigurableApi } from './configurable-API.entity';

@Entity({ name: 'expansionRules' })
export class ExpansionRule {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'varchar' })
  ruleName: string;

  @Column({ type: 'int' })
  targetApiId: number;

  @Column({ type: 'varchar', nullable: true })
  objectName: string;

  @Column({ type: 'varchar' })
  centrisField: string;

  @Column({ type: 'varchar' })
  vaultField: string;

  @Column({ type: 'varchar' })
  dataType: string;

  @Column({ type: 'varchar', nullable: true })
  fieldValue: string;

  @Column({ default: true, nullable: true })
  allowNull: boolean;

  @Column({ type: 'varchar', nullable: true })
  customLogic: string;

  @ManyToOne(() => ConfigurableApi)
  @JoinColumn({ name: 'targetApiId', referencedColumnName: 'id' })
  targetApi: ConfigurableApi;
}
