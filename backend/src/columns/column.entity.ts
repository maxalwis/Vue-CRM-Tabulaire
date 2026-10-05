import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

export type ColumnType = 'text' | 'number' | 'date' | 'phone';

@Entity('columns')
export class ColumnEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'text' })
  name!: string;

  @Column({ type: 'text' })
  type!: ColumnType;

  @Column({ type: 'int' })
  position!: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
