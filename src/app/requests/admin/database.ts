/**
 * Estúdio de banco pela API (`/admin/database/*`, só SUPER_ADMIN).
 *
 * Diferenças do legado que o estúdio sente:
 * - os models vêm do schema, com o nome do Prisma (`User`, `WorkScore`); a
 *   categoria de cada um é deduzida do nome aqui (o legado tinha um mapa de 70
 *   entradas escrito à mão na rota);
 * - campo protegido (senha, token, segredo) não é lido, filtrado nem escrito;
 * - toda escrita leva uma frase de confirmação com o alvo: `CRIAR <Model>`,
 *   `ATUALIZAR <Model> <id>`, `APAGAR <n> <Model>`;
 * - id, datas geradas e campos protegidos são recusados na escrita: o request
 *   manda só o que o schema diz que aceita escrita;
 * - filtro é `{ field, operator, value }`; os operadores do painel (`equals`,
 *   `not`…) viram os da API (`eq`, `ne`…).
 */
import { apiFetch } from '@/app/libs/api/client';
import { downloadFromApi } from '@/app/requests/admin/common';
import type {
  DatabaseModel,
  ModelField,
  ModelSchema,
} from '@/app/hooks/admin/useDatabaseStudio';

const noStore = { cache: 'no-store' as const };

interface ApiField {
  name: string;
  type: string;
  kind: string;
  isList: boolean;
  isRequired: boolean;
  isId: boolean;
  isProtected: boolean;
  isWritable: boolean;
}

// Categoria da tela pelo nome do model.
const CATEGORY_RULES: [RegExp, DatabaseModel['category']][] = [
  [
    /^(AdminAuditLog|Advertisement|AdStats|Coupon|CouponUsage|PlanPricing|Subscription|Payment|GeneratedReport|ProcessedWebhookEvent)/,
    'admin',
  ],
  [
    /^(StoredAsset|UserToken|Notification|Newsletter|EmailTemplate|TestEmailList|Scraper|Job|Event|Venue|Import)/,
    'system',
  ],
  [
    /^(Favorite|Annotation|WorkAnnotation|Learned|WantToLearn|Comment|Blog(Comment|Like|Bookmark|Interaction)|Report|Moderation|Performance)/,
    'social',
  ],
  [/^(Composer|Work|Epoch|Instrument|Genre|Category|Blog|Tag|Role)/, 'content'],
];

function categoryOf(name: string): DatabaseModel['category'] {
  return CATEGORY_RULES.find(([pattern]) => pattern.test(name))?.[1] ?? 'core';
}

export async function listDatabaseModels(): Promise<DatabaseModel[]> {
  const data = await apiFetch<{
    models: {
      name: string;
      fields: number;
      readableFields: number;
      records: number | null;
    }[];
  }>('/admin/database/models', noStore);

  return data.models.map((model) => ({
    name: model.name,
    displayName: model.name.replace(/([a-z])([A-Z])/g, '$1 $2'),
    count: model.records ?? 0,
    category: categoryOf(model.name),
    totalFields: model.fields,
  }));
}

function toModelField(field: ApiField): ModelField {
  return {
    name: field.name,
    type: field.type,
    kind: (['scalar', 'object', 'enum'].includes(field.kind)
      ? field.kind
      : 'unsupported') as ModelField['kind'],
    isRequired: field.isRequired,
    isUnique: false,
    isId: field.isId,
    isList: field.isList,
    isReadOnly: !field.isWritable,
    hasDefaultValue: false,
    relationTo: field.kind === 'object' ? field.type : undefined,
    isSensitive: field.isProtected,
    isEditableByConfig: field.isWritable,
    requiresConfirmation: false,
  };
}

/** Campos do model e o que a tela pode mostrar (legíveis, sem relação). */
export async function describeDatabaseModel(model: string) {
  const data = await apiFetch<{
    name: string;
    idField: string;
    fields: ApiField[];
  }>('/admin/database/schema', { query: { model }, ...noStore });
  const fields = data.fields.map(toModelField);
  const displayable = data.fields.filter(
    (field) => !field.isProtected && field.kind !== 'object'
  );

  const schema: ModelSchema = { name: data.name, fields, indexes: [] };

  return {
    schema,
    idField: data.idField,
    availableFields: displayable.map((field) => field.name),
    stats: {
      totalFields: data.fields.length,
      displayableFields: displayable.length,
      editableFields: data.fields.filter(
        (field) => field.isWritable && field.kind !== 'object'
      ).length,
      searchableFields: displayable.filter((field) => field.type === 'String')
        .length,
    },
  };
}

const OPERATOR: Record<string, string> = {
  equals: 'eq',
  not: 'ne',
  contains: 'contains',
  startsWith: 'startsWith',
  endsWith: 'endsWith',
  gt: 'gt',
  gte: 'gte',
  lt: 'lt',
  lte: 'lte',
  in: 'in',
};

/** `{ campo: valor }` ou `{ campo: { operador: valor } }` do painel → lista da API. */
function toApiFilters(active: Record<string, unknown>) {
  return Object.entries(active).map(([field, value]) => {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      const [operator, operand] = Object.entries(
        value as Record<string, unknown>
      )[0] ?? ['equals', undefined];
      return { field, operator: OPERATOR[operator] ?? 'eq', value: operand };
    }
    return { field, operator: 'eq', value };
  });
}

export interface RecordQuery {
  model: string;
  search?: string;
  sortField?: string | null;
  sortDirection?: 'asc' | 'desc';
  fields?: string[];
  filters?: Record<string, unknown>;
}

function recordQuery(query: RecordQuery) {
  const filters = toApiFilters(query.filters ?? {});

  return {
    model: query.model,
    search: query.search || undefined,
    sortField: query.sortField || undefined,
    sortDirection: query.sortField ? query.sortDirection : undefined,
    fields: query.fields?.length ? query.fields.join(',') : undefined,
    filters: filters.length ? JSON.stringify(filters) : undefined,
  };
}

export async function listDatabaseRecords(
  query: RecordQuery,
  page: number,
  pageSize: number
) {
  const data = await apiFetch<{
    records: Record<string, unknown>[];
    pagination: { total: number };
  }>('/admin/database/records', {
    query: { ...recordQuery(query), page, pageSize: Math.min(pageSize, 200) },
    ...noStore,
  });

  return { records: data.records, total: data.pagination.total };
}

/** Só os campos que o schema diz que aceitam escrita (sem id, datas geradas, protegidos e relações). */
function writableData(
  data: Record<string, unknown>,
  schema: ModelSchema | null
) {
  if (!schema) return data;

  const writable = new Set(
    schema.fields
      .filter((field) => !field.isReadOnly && field.kind !== 'object')
      .map((field) => field.name)
  );

  return Object.fromEntries(
    Object.entries(data).filter(([key]) => writable.has(key))
  );
}

export function createDatabaseRecord(
  model: string,
  data: Record<string, unknown>,
  schema: ModelSchema | null
) {
  return apiFetch('/admin/database/records', {
    method: 'POST',
    body: {
      model,
      data: writableData(data, schema),
      confirmation: `CRIAR ${model}`,
    },
  });
}

export function updateDatabaseRecord(
  model: string,
  id: string,
  data: Record<string, unknown>,
  schema: ModelSchema | null
) {
  return apiFetch(`/admin/database/records/${model}/${id}`, {
    method: 'PATCH',
    body: {
      data: writableData(data, schema),
      confirmation: `ATUALIZAR ${model} ${id}`,
    },
  });
}

/** A frase que a API exige para apagar — a tela pede para digitá-la. */
export const deleteConfirmationPhrase = (model: string, count: number) =>
  `APAGAR ${count} ${model}`;

export function deleteDatabaseRecords(model: string, ids: string[]) {
  return apiFetch<{ deletedCount: number; notFound: number }>(
    '/admin/database/records',
    {
      method: 'DELETE',
      body: {
        model,
        ids,
        confirmation: deleteConfirmationPhrase(model, ids.length),
      },
    }
  );
}

export function exportDatabaseRecords(
  query: RecordQuery,
  format: 'json' | 'csv'
) {
  return downloadFromApi(
    '/admin/database/export',
    { ...recordQuery(query), format },
    `${query.model}_${new Date().toISOString()}.${format}`
  );
}
