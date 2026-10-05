import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { ColumnEntity } from '../columns/column.entity';
import { ListContactsDto } from './dto/list-contacts.dto';
import { buildListQuery, encodeCursor, parseFilters } from './contacts.query';

interface ContactRow {
  id: number;
  values: Record<string, string | number | null>;
  sort_key: string | null;
}

@Injectable()
export class ContactsService {
  constructor(
    @InjectRepository(ColumnEntity)
    private readonly columns: Repository<ColumnEntity>,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  async list(dto: ListContactsDto) {
    const columns = await this.columns.find();
    const query = buildListQuery(columns, {
      limit: dto.limit,
      sortBy: dto.sortBy,
      sortDir: dto.sortDir,
      cursor: dto.cursor,
      filters: parseFilters(dto.filters),
    });

    const rows: ContactRow[] = await this.dataSource.query(query.sql, query.args);
    const hasMore = rows.length > dto.limit;
    const page = rows.slice(0, dto.limit);
    const last = page[page.length - 1];

    let total: number | undefined;
    if (!dto.cursor) {
      const [{ total: count }] = await this.dataSource.query(
        query.countSql,
        query.countArgs,
      );
      total = Number(count);
    }

    return {
      items: page.map(({ id, values }) => ({ id, values })),
      nextCursor:
        hasMore && last ? encodeCursor({ v: last.sort_key, id: last.id }) : null,
      total,
    };
  }

  async create(values: Record<string, any> = {}) {
    const [result] = await this.dataSource.query(
      `INSERT INTO contacts (values) VALUES ($1) RETURNING id, values`,
      [JSON.stringify(values)],
    );
    return result;
  }

  async update(id: number, valuesToUpdate: Record<string, any>) {
    // Fusionne le JSON existant avec les nouvelles valeurs
    const [result] = await this.dataSource.query(
      `UPDATE contacts
       SET values = values || $1::jsonb
       WHERE id = $2
       RETURNING id, values`,
      [JSON.stringify(valuesToUpdate), id],
    );

    if (!result) {
      throw new NotFoundException(`Contact #${id} introuvable`);
    }

    return result;
  }

  async remove(id: number) {
    const [result] = await this.dataSource.query(
      `DELETE FROM contacts WHERE id = $1 RETURNING id`,
      [id],
    );

    if (!result) {
      throw new NotFoundException(`Contact #${id} introuvable`);
    }

    return { success: true };
  }
}
