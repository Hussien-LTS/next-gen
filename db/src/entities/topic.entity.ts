import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity()
export class Topic {
  @PrimaryColumn()
  Id: string;

  @Column({ nullable: true })
  ModifiedDateTime: string;

  @Column({ nullable: true })
  ExternalId: string;

  @Column({ nullable: true })
  Description: string;

  @Column({ nullable: true })
  Status: string;

  @Column({
    type: 'nvarchar',
    nullable: true,
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
}
