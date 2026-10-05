import { BadRequestException } from '@nestjs/common';
import { ColumnEntity, ColumnType } from '../columns/column.entity';

export type FilterOp =
  | 'contains' | 'eq' | 'gt' | 'gte' | 'lt' | 'lte' | 'empty' | 'notEmpty';
export type SortDir = 'asc' | 'desc';

export interface Filter {
  columnId: string;
  op: FilterOp;
  value?: string | number;
}

export interface ListParams {
  limit: number;
  sortBy?: string;
  sortDir: SortDir;
  cursor?: string;
  filters: Filter[];
}

export interface Cursor {
  v: string | null;
  id: number;
}

const ALL_OPS: FilterOp[] = [
  'contains', 'eq', 'gt', 'gte', 'lt', 'lte', 'empty', 'notEmpty',
];

// Opérateurs autorisés par type de colonne
const OPS_BY_TYPE: Record<ColumnType, FilterOp[]> = {
  text: ['contains', 'eq', 'empty', 'notEmpty'],
  phone: ['contains', 'eq', 'empty', 'notEmpty'],
  number: ['eq', 'gt', 'gte', 'lt', 'lte', 'empty', 'notEmpty'],
  date: ['eq', 'gt', 'gte', 'lt', 'lte', 'empty', 'notEmpty'],
};

const SQL_CAST: Record<ColumnType, string> = {
  text: 'text',
  phone: 'text',
  number: 'numeric',
  date: 'date',
};

const SQL_COMPARATORS: Partial<Record<FilterOp, string>> = {
  eq: '=', gt: '>', gte: '>=', lt: '<', lte: '<=',
};

class Args {
  readonly list: unknown[] = [];
  add(value: unknown): string {
    this.list.push(value);
    return `$${this.list.length}`;
  }
}

function isValidIsoDate(s: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const d = new Date(`${s}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s;
}

function normalizeValue(type: ColumnType, value: unknown): string {
  if (value === undefined || value === '') {
    throw new BadRequestException('Filter value is required');
  }
  switch (type) {
    case 'number': {
      const n = Number(value);
      if (!Number.isFinite(n)) throw new BadRequestException('Invalid number');
      return String(n);
    }
    case 'date': {
      const s = String(value);
      if (!isValidIsoDate(s)) {
        throw new BadRequestException('Dates must be YYYY-MM-DD');
      }
      return s;
    }
    case 'phone':
      return String(value).replace(/[\s.\-()]/g, '');
    default:
      return String(value).trim();
  }
}

export function parseFilters(raw?: string): Filter[] {
  if (!raw) return [];
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    throw new BadRequestException('filters must be valid JSON');
  }
  if (!Array.isArray(data) || data.length > 20) {
    throw new BadRequestException('filters must be an array of at most 20 items');
  }
  return data.map((item): Filter => {
    if (typeof item !== 'object' || item === null) {
      throw new BadRequestException('Invalid filter');
    }
    const { columnId, op, value } = item as Record<string, unknown>;
    if (
      typeof columnId !== 'string' ||
      typeof op !== 'string' ||
      !ALL_OPS.includes(op as FilterOp) ||
      (value !== undefined && typeof value !== 'string' && typeof value !== 'number')
    ) {
      throw new BadRequestException('Invalid filter');
    }
    return { columnId, op: op as FilterOp, value };
  });
}

export function encodeCursor(cursor: Cursor): string {
  return Buffer.from(JSON.stringify(cursor)).toString('base64url');
}

export function decodeCursor(raw: string): Cursor {
  try {
    const data = JSON.parse(Buffer.from(raw, 'base64url').toString('utf8'));
    if (
      Number.isInteger(data?.id) &&
      (data.v === null || typeof data.v === 'string')
    ) {
      return { v: data.v, id: data.id };
    }
  } catch {
    // tombe dans l'erreur ci-dessous
  }
  throw new BadRequestException('Invalid cursor');
}

export interface BuiltQuery {
  sql: string;
  args: unknown[];
  countSql: string;
  countArgs: unknown[];
}

export function buildListQuery(
  columns: ColumnEntity[],
  params: ListParams,
): BuiltQuery {
  const byId = new Map(columns.map((c) => [c.id, c]));
  const args = new Args();
  const where: string[] = [];

  // 1. Filtres : valeurs toujours passées en paramètres, jamais concaténées
  for (const f of params.filters) {
    const col = byId.get(f.columnId);
    if (!col) throw new BadRequestException(`Unknown column ${f.columnId}`);
    if (!OPS_BY_TYPE[col.type].includes(f.op)) {
      throw new BadRequestException(`Operator ${f.op} not allowed on ${col.type}`);
    }
    const cell = `NULLIF("values" ->> ${args.add(col.id)}::text, '')`;
    const cast = SQL_CAST[col.type];

    if (f.op === 'empty') {
      where.push(`${cell} IS NULL`);
    } else if (f.op === 'notEmpty') {
      where.push(`${cell} IS NOT NULL`);
    } else {
      const value = normalizeValue(col.type, f.value);
      if (f.op === 'contains') {
        const escaped = value.replace(/[\\%_]/g, '\\$&');
        where.push(`${cell} ILIKE '%' || ${args.add(escaped)}::text || '%'`);
      } else if (f.op === 'eq' && cast === 'text') {
        where.push(`lower(${cell}) = lower(${args.add(value)}::text)`);
      } else {
        where.push(
          `(${cell})::${cast} ${SQL_COMPARATORS[f.op]} ${args.add(value)}::${cast}`,
        );
      }
    }
  }

  const filterWhere = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const countArgs = [...args.list]; // le count n'utilise que les filtres

  // 2. Expression de tri (typée, '' traité comme NULL, texte insensible à la casse)
  const dir = params.sortDir === 'desc' ? 'DESC' : 'ASC';
  let sortExpr = '"id"';
  let sortCast = 'int';
 if (params.sortBy && params.sortBy !== 'id') {
  const col = byId.get(params.sortBy);
  if (!col) throw new BadRequestException('Unknown sort column');
  const cell = `NULLIF("values" ->> ${args.add(col.id)}::text, '')`;
  sortCast = SQL_CAST[col.type];
  sortExpr = sortCast === 'text' ? `lower(${cell})` : `(${cell})::${sortCast}`;
}

  // 3. Curseur keyset : (valeur de tri, id) avec NULL en dernier
  if (params.cursor) {
    const c = decodeCursor(params.cursor);
    const idP = args.add(c.id);
    if (c.v === null) {
      where.push(`(${sortExpr} IS NULL AND "id" > ${idP}::int)`);
    } else {
      const vP = args.add(c.v);
      const cmp = dir === 'ASC' ? '>' : '<';
      where.push(
        `(${sortExpr} ${cmp} CAST(${vP} AS ${sortCast})` +
          ` OR (${sortExpr} = CAST(${vP} AS ${sortCast}) AND "id" > ${idP}::int)` +
          ` OR ${sortExpr} IS NULL)`,
      );
    }
  }

  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const limitP = args.add(params.limit + 1); // +1 pour savoir s'il y a une page suivante

  return {
    sql:
      `SELECT "id", "values", (${sortExpr})::text AS sort_key FROM "contacts" ${whereSql} ` +
      `ORDER BY ${sortExpr} ${dir} NULLS LAST, "id" ASC LIMIT ${limitP}`,
    args: args.list,
    countSql: `SELECT count(*)::int AS total FROM "contacts" ${filterWhere}`,
    countArgs,
  };
}
