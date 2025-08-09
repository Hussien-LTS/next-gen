import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class AuthConfig {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  authKey: string;

  @Column({ type: 'varchar', length: 1000, nullable: false })
  authValue: string;
}
