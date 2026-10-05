import 'dotenv/config';
import { fakerFR as faker } from '@faker-js/faker';
import { DataSource } from 'typeorm';
import { ColumnEntity, ColumnType } from './columns/column.entity';
import { Contact } from './contacts/contact.entity';

const CONTACT_COUNT = Number(process.env.SEED_COUNT ?? 1000);
const BATCH_SIZE = 500;

const DEFAULT_COLUMNS: { name: string; type: ColumnType }[] = [
  { name: 'Nom', type: 'text' },
  { name: 'Entreprise', type: 'text' },
  { name: 'Téléphone', type: 'phone' },
  { name: 'Dernier contact', type: 'date' },
  { name: 'Score', type: 'number' },
];

function fakePhone(): string {
  const prefix = faker.helpers.arrayElement(['6', '7']);
  return `+33${prefix}${faker.string.numeric(8)}`;
}

async function main(): Promise<void> {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST ?? 'localhost',
    port: Number(process.env.DB_PORT ?? 5432),
    username: process.env.DB_USER ?? 'crm',
    password: process.env.DB_PASSWORD ?? 'crm',
    database: process.env.DB_NAME ?? 'crm',
    entities: [ColumnEntity, Contact],
    migrations: [__dirname + '/migrations/*{.ts,.js}'],
  });

  await dataSource.initialize();
  try {
    await dataSource.runMigrations();

    const existing = await dataSource.getRepository(Contact).count();
    if (existing > 0) {
      console.log(`Seed ignoré : ${existing} contacts déjà présents.`);
      return;
    }

    await dataSource.transaction(async (manager) => {
      const columns: ColumnEntity[] = [];
      for (const [index, def] of DEFAULT_COLUMNS.entries()) {
        const column = manager.create(ColumnEntity, { ...def, position: index });
        columns.push(await manager.save(column));
      }
      const idOf = (name: string): string =>
        columns.find((c) => c.name === name)!.id;

      const rows = Array.from({ length: CONTACT_COUNT }, () => ({
        values: {
          [idOf('Nom')]: faker.person.fullName(),
          [idOf('Entreprise')]: faker.company.name(),
          [idOf('Téléphone')]: fakePhone(),
          [idOf('Dernier contact')]: faker.date
            .past({ years: 3 })
            .toISOString()
            .slice(0, 10),
          [idOf('Score')]: faker.number.int({ min: 0, max: 100 }),
        },
      }));

      for (let i = 0; i < rows.length; i += BATCH_SIZE) {
        await manager.insert(Contact, rows.slice(i, i + BATCH_SIZE));
      }
    });

    console.log(`Seed terminé : ${CONTACT_COUNT} contacts créés.`);
  } finally {
    await dataSource.destroy();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
