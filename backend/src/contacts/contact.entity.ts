import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('contacts')
export class Contact {
  @PrimaryGeneratedColumn()
  id!: number;

  // clé = id de la colonne, valeur = donnée de la cellule
  @Column({ type: 'jsonb', default: () => `'{}'::jsonb` })
  values!: Record<string, string | number | null>;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
