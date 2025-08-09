import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
} from 'typeorm';
import { ExpansionRule } from './expansion-rule.entity';

@Entity({ name: 'configurableAPIs' })
export class ConfigurableApi {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'varchar' })
  apiName: string;

  @OneToMany(() => ExpansionRule, (expansionRule) => expansionRule.targetApi)
  targetApi: ExpansionRule[];
}
