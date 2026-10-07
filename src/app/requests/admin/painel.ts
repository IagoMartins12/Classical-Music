/**
 * As rotas do painel redesenhado (29/09/2026), no formato em que a API
 * responde — sem a tradução para os formatos do legado que os outros
 * arquivos desta pasta ainda fazem para as telas antigas.
 *
 * - `/admin/metrics/attention`: o que pede alguém hoje (topo do painel e
 *   números do menu).
 * - `/admin/subscriptions*`: receita e assinantes.
 * - `/admin/audit*`: a trilha completa, com o que mudou em cada ação.
 */
import { apiFetch } from '@/app/libs/api/client';
import { downloadFromApi } from './common';

const noStore = { cache: 'no-store' as const };

type Bloco<T> = T | { erro: string };

export const temErro = <T extends object>(
  bloco: Bloco<T> | undefined
): bloco is { erro: string } => !!bloco && 'erro' in bloco;

// ---------------------------------------------------------------------------
// Pendências
// ---------------------------------------------------------------------------

export interface Pendencias {
  geradoEm: string;
  denuncias: Bloco<{
    abertas: number;
    atrasadas: number;
    urgentes: number;
    maisAntigaEm: string | null;
  }>;
  blog: Bloco<{
    comentarios: number;
    sinalizados: number;
    emRevisao: number;
    artigoComMaisPendentes: { titulo: string; pendentes: number } | null;
  }>;
  filas: Bloco<{
    falhas24h: number;
    porFila: {
      fila: string;
      falhas24h: number;
      ultima: { job: string; motivo: string | null; em: string } | null;
    }[];
    paradas: {
      fila: string;
      esperando: number;
      maisAntigoSegundos: number | null;
    }[];
    pausadas: string[];
  }>;
  backup: Bloco<{
    ultimo: {
      status: string;
      startedAt: string;
      finishedAt: string | null;
      verifiedAt: string | null;
      sizeBytes: number | null;
      documentCount: number | null;
      error: string | null;
    } | null;
    verificadoEm: string | null;
    velho: boolean;
  }>;
  cobranca: Bloco<{ emAtraso: number; testesVencendo3Dias: number }>;
  newsletter: Bloco<{
    proxima: {
      id: string;
      name: string;
      scheduledAt: string;
      totalSubscribers: number;
    } | null;
    falhadas7Dias: number;
  }>;
}

export const getPendencias = () =>
  apiFetch<Pendencias>('/admin/metrics/attention', noStore);

// ---------------------------------------------------------------------------
// Assinaturas
// ---------------------------------------------------------------------------

export type Plano = 'FREE' | 'PLUS' | 'MENTOR' | 'MAESTRO';
export type PeriodoCobranca = 'MONTHLY' | 'YEARLY';
export type EstadoAssinatura =
  | 'ativas'
  | 'teste'
  | 'atraso'
  | 'vao-sair'
  | 'nao-renovaram'
  | 'expiradas'
  | 'pendentes'
  | 'todas';

export interface PanoramaAssinaturas {
  periodo: { dias: number; desde: string };
  receita: {
    total: number;
    pagamentosTotal: number;
    periodo: number;
    periodoAnterior: number;
    pagamentos: number;
    ticketMedio: number | null;
    descontos: number;
    reembolsos: { valor: number; quantidade: number };
    porMes: { mes: string; valor: number; pagamentos: number }[];
    porMetodo: { metodo: string; valor: number; pagamentos: number }[];
  };
  recorrente: {
    mensal: number;
    anualizado: number;
    semPreco: number;
    porPlano: { plano: Plano; mensal: number }[];
  };
  assinantes: {
    vivas: number;
    ativas: number;
    teste: number;
    atraso: number;
    canceladasComAcesso: number;
    porPlano: { plano: Plano; mensal: number; anual: number; total: number }[];
  };
  movimento: {
    novos: number;
    cancelaram: number;
    taxaCancelamento: { valor: number | null; base: number };
    expiraram: number;
    vaoSair: number;
    naoRenovaram: number;
    checkoutsAbandonados: number;
    testesVencendo7Dias: number;
  };
  naoRenovaramRecentes: {
    id: string;
    usuario: { id: string; nome: string; email: string | null };
    plano: Plano;
    periodo: PeriodoCobranca | null;
    venceuEm: string | null;
    totalPago: number;
  }[];
}

export interface LinhaAssinatura {
  id: string;
  usuario: {
    id: string;
    nome: string;
    email: string | null;
    imagem: string | null;
  };
  plano: Plano;
  periodo: PeriodoCobranca | null;
  status: string;
  estado: EstadoAssinatura;
  inicio: string;
  fim: string | null;
  fimDoTeste: string | null;
  canceladaEm: string | null;
  preco: number | null;
  moeda: string;
  renovaSozinha: boolean;
  cupom: string | null;
  criadaEm: string;
  totalPago: number;
  pagamentos: number;
}

export interface DetalheAssinatura extends Omit<
  LinhaAssinatura,
  'cupom' | 'pagamentos' | 'criadaEm'
> {
  usuario: LinhaAssinatura['usuario'] & { desde: string };
  cupom: { code: string; type: string; discountValue: number } | null;
  stripe: { assinatura: string | null; cliente: string | null };
  pagamentos: {
    id: string;
    amount: number;
    discountAmount: number | null;
    finalAmount: number;
    currency: string;
    status: string;
    paymentMethod: string | null;
    paidAt: string | null;
    createdAt: string;
  }[];
  historico: {
    id: string;
    acao: string;
    de: Plano | null;
    para: Plano | null;
    precoDe: number | null;
    precoPara: number | null;
    motivo: string | null;
    em: string;
  }[];
  outrasAssinaturas: {
    id: string;
    planType: Plano;
    billingPeriod: PeriodoCobranca | null;
    status: string;
    startDate: string;
    endDate: string | null;
    cancelledAt: string | null;
  }[];
}

export interface FiltrosAssinatura {
  estado?: EstadoAssinatura;
  plano?: Plano;
  periodo?: PeriodoCobranca;
  busca?: string;
}

export const getPanoramaAssinaturas = (dias: number) =>
  apiFetch<PanoramaAssinaturas>('/admin/subscriptions/overview', {
    ...noStore,
    query: { days: dias },
  });

export const getAssinaturas = (filtros: FiltrosAssinatura, cursor?: string) =>
  apiFetch<{
    items: LinhaAssinatura[];
    total: number | null;
    nextCursor: string | null;
  }>('/admin/subscriptions', {
    ...noStore,
    query: {
      estado: filtros.estado,
      plano: filtros.plano,
      periodo: filtros.periodo,
      busca: filtros.busca?.trim() || undefined,
      cursor,
      limit: 25,
    },
  });

export const getAssinatura = (id: string) =>
  apiFetch<DetalheAssinatura>(`/admin/subscriptions/${id}`, noStore);

// ---------------------------------------------------------------------------
// Auditoria
// ---------------------------------------------------------------------------

export interface Mudanca {
  campo: string;
  antes: unknown;
  depois: unknown;
}

export interface RegistroAuditoria {
  id: string;
  actorId: string | null;
  actorName: string | null;
  actorRole: string | null;
  action: string;
  entityType: string | null;
  entityId: string | null;
  metadata: {
    alvo?: string;
    mudancas?: Mudanca[];
    dados?: Record<string, unknown>;
    error?: string;
    mensagem?: string;
    [chave: string]: unknown;
  } | null;
  ipAddress: string | null;
  userAgent: string | null;
  requestId: string | null;
  success: boolean;
  createdAt: string;
}

export interface FiltrosAuditoria {
  action?: string;
  actionPrefix?: string;
  actorId?: string;
  entityType?: string;
  entityId?: string;
  onlyFailures?: boolean;
  from?: string;
  to?: string;
  verb?: 'create' | 'update' | 'delete' | 'other';
  actorRole?: number;
  ip?: string;
  /** Nome do registro afetado, como estava na hora (contém). */
  target?: string;
  /** Só as ações que mudaram este campo. */
  field?: string;
}

const consultaAuditoria = (f: FiltrosAuditoria) => ({
  action: f.action || undefined,
  actionPrefix: f.actionPrefix || undefined,
  actorId: f.actorId || undefined,
  entityType: f.entityType || undefined,
  entityId: f.entityId || undefined,
  onlyFailures: f.onlyFailures || undefined,
  from: f.from || undefined,
  to: f.to || undefined,
  verb: f.verb,
  actorRole: f.actorRole,
  ip: f.ip?.trim() || undefined,
  target: f.target?.trim() || undefined,
  field: f.field?.trim() || undefined,
});

/**
 * Apaga registros da trilha: os escolhidos (`ids`) ou tudo o que casa com os
 * filtros. A API grava um `audit.purge` com quem, quantos e o critério — e
 * esse registro nenhuma limpeza apaga.
 */
export const apagarDaAuditoria = (c: {
  ids?: string[];
  filtros?: FiltrosAuditoria;
}) =>
  apiFetch<{ apagados: number }>('/admin/audit/purge', {
    method: 'POST',
    body: c.ids
      ? { ids: c.ids }
      : {
          filtros: JSON.parse(
            JSON.stringify(consultaAuditoria(c.filtros ?? {}))
          ) as Record<string, unknown>,
        },
  });

export const getAuditoria = (
  filtros: FiltrosAuditoria,
  cursor?: string,
  limit = 50
) =>
  apiFetch<{
    entries: RegistroAuditoria[];
    pagination: { total: number | null; nextCursor: string | null };
  }>('/admin/audit', {
    ...noStore,
    query: { ...consultaAuditoria(filtros), cursor, limit },
  });

export interface FacetasAuditoria {
  actions: { action: string; count: number }[];
  entityTypes: { entityType: string; count: number }[];
  actors: { actorId: string | null; name: string | null; count: number }[];
}

export const getFacetasAuditoria = () =>
  apiFetch<FacetasAuditoria>('/admin/audit/facets', noStore);

export interface ResumoAuditoria {
  period: { days: number; since: string };
  total: number;
  failures: number;
  failureRate: number | null;
  byAction: { action: string; count: number }[];
  topActors: { actorId: string | null; name: string | null; count: number }[];
}

export const getResumoAuditoria = (dias: number) =>
  apiFetch<ResumoAuditoria>('/admin/audit/summary', {
    ...noStore,
    query: { days: dias },
  });

export const exportarAuditoria = (filtros: FiltrosAuditoria) =>
  downloadFromApi(
    '/admin/audit/export',
    { ...consultaAuditoria(filtros), format: 'csv' },
    `auditoria-${new Date().toISOString().slice(0, 10)}.csv`
  );

// ---------------------------------------------------------------------------
// Números de base e série diária
// ---------------------------------------------------------------------------

export type SerieDeAtividade =
  | 'cadastros'
  | 'anotacoes'
  | 'envios'
  | 'favoritos'
  | 'querem'
  | 'aprendidas'
  | 'comentarios'
  | 'partituras';

export interface Atividade {
  dias: number;
  serie: ({ dia: string } & Record<SerieDeAtividade, number>)[];
  totais: Record<SerieDeAtividade, number>;
  /** A janela anterior, do mesmo tamanho, para comparar. */
  totaisAnteriores: Record<SerieDeAtividade, number>;
}

export const getAtividade = (dias: number) =>
  apiFetch<Atividade>('/admin/metrics/activity', {
    ...noStore,
    query: { days: dias },
  });

export { getMetricsOverview as getPanorama } from './metrics';
export type { MetricsOverview as Panorama } from './metrics';

// ---------------------------------------------------------------------------
// Uso da plataforma
// ---------------------------------------------------------------------------

export type PeriodoAnalise = '7d' | '30d' | '90d' | '1y';

export interface AnaliseUsuarios {
  period: PeriodoAnalise;
  total: number;
  newInPeriod: number;
  growthRate: number | null;
  activeInPeriod: number;
  teachers: number;
  byUserType: Record<string, number>;
  byRole: Record<string, number>;
}

export const getAnaliseUsuarios = (period: PeriodoAnalise) =>
  apiFetch<AnaliseUsuarios>('/admin/users/analytics', {
    ...noStore,
    query: { period },
  });

export interface MetricasCatalogo {
  totals: {
    composers: number;
    verifiedComposers: number;
    works: number;
    verifiedWorks: number;
    activeScores: number;
  };
  coverage: {
    composersVerifiedRate: number | null;
    worksVerifiedRate: number | null;
  };
  scoresByType: Record<string, number>;
  composersByDataQuality: Record<string, number>;
}

export const getMetricasCatalogo = () =>
  apiFetch<MetricasCatalogo>('/admin/catalog/metrics', noStore);

export const getObrasPorEpoca = () =>
  apiFetch<{ epochId: string; name: string; works: number }[]>(
    '/admin/catalog/by-epoch',
    noStore
  );

export const getMaisAnotadas = () =>
  apiFetch<
    {
      id: string;
      title: string;
      annotationsCount: number;
      composer: { id: string; name: string } | null;
    }[]
  >('/admin/catalog/most-annotated', noStore);

export const getContribuidores = () =>
  apiFetch<
    {
      userId: string;
      name: string | null;
      image: string | null;
      contributions: number;
    }[]
  >('/admin/uploads/contributors', noStore);

export const getInsightsDaArea = (areas: string) =>
  apiFetch<import('./metrics').MetricsInsights>('/admin/metrics/insights', {
    ...noStore,
    query: { areas },
  });

// ---------------------------------------------------------------------------
// Denúncias
// ---------------------------------------------------------------------------

export type EstadoDenuncia = 'pending' | 'approved' | 'rejected' | 'all';
export type AcaoDenuncia = 'approve' | 'reject' | 'delete';

export interface Denuncia {
  id: string;
  entityType: 'composer' | 'work' | 'score' | 'blog-comment';
  entityId: string;
  reason: string;
  description: string | null;
  status: 'pending' | 'approved' | 'rejected';
  priority: 'urgent' | 'high' | 'normal' | 'low';
  category: string | null;
  categoryLabel: string | null;
  moderationNotes: string | null;
  resolution: string | null;
  createdAt: string;
  resolvedAt: string | null;
  slaHoursLeft: number;
  overdue: boolean;
  reporter: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string | null;
  } | null;
  moderator: {
    id: string;
    firstName: string | null;
    lastName: string | null;
  } | null;
  entity: {
    id: string;
    name?: string;
    fullName?: string | null;
    title?: string;
    subtitle?: string | null;
    content?: string;
    isVerified?: boolean;
    downloadUrl?: string | null;
    composer?: { name: string; fullName: string | null } | null;
    work?: { id: string; title: string } | null;
    articleId?: string;
  } | null;
}

export interface EstatisticasDenuncias {
  byStatus: Record<string, number>;
  pending: {
    total: number;
    overdue: number;
    byPriority: Record<string, number>;
    byEntityType: Record<string, number>;
  };
  period: {
    days: number;
    reported: number;
    resolved: number;
    avgResolutionHours: number | null;
    byCategory: Record<string, number>;
  };
}

export const getDenuncias = (
  filtros: { status: EstadoDenuncia; entityType?: string; entityId?: string },
  page: number
) =>
  apiFetch<{
    reports: Denuncia[];
    pagination: { page: number; total: number; totalPages: number };
  }>('/uploads/moderation', {
    ...noStore,
    query: {
      status: filtros.status,
      entityType: filtros.entityType,
      entityId: filtros.entityId,
      page,
      limit: 20,
    },
  });

export const getEstatisticasDenuncias = (dias = 30) =>
  apiFetch<EstatisticasDenuncias>('/uploads/moderation/stats', {
    ...noStore,
    query: { days: dias },
  });

export const resolverDenuncia = (
  id: string,
  action: AcaoDenuncia,
  notes?: string
) =>
  apiFetch(`/uploads/moderation/${id}`, {
    method: 'PATCH',
    body: { action, notes: notes?.trim() || undefined },
  });

export const resolverDenuncias = (
  ids: string[],
  action: Exclude<AcaoDenuncia, 'delete'>
) =>
  apiFetch<{
    resolved: number;
    failed: number;
    outcomes: { status: string; reason?: string }[];
  }>('/uploads/moderation', {
    method: 'PATCH',
    body: { moderationIds: ids, action },
  });

// ---------------------------------------------------------------------------
// Usuários
// ---------------------------------------------------------------------------

export interface DetalheUsuario {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  username: string | null;
  image: string | null;
  bio: string | null;
  role: number;
  userType: string | null;
  experienceLevel: string | null;
  isTeacher: boolean;
  isStudent: boolean;
  profilePublic: boolean;
  onboardingCompleted: boolean;
  createdAt: string;
  lastSeen: string | null;
  teacherProfile: {
    status: string;
    isVerified: boolean;
    totalStudents: number;
    totalLessons: number;
  } | null;
  studentProfile: {
    level: string | null;
    status: string;
    totalLessonsAttended: number;
    currentStreak: number;
  } | null;
  emailVerified: string | null;
  counts: {
    annotations: number;
    favorites: number;
    learned: number;
    uploads: number;
    wantToLearn: number;
    contributions: number;
  };
  assinatura: {
    id: string;
    planType: Plano;
    billingPeriod: PeriodoCobranca | null;
    status: string;
    endDate: string | null;
    trialEndDate: string | null;
  } | null;
  historicoNoPainel: {
    id: string;
    action: string;
    actorId: string | null;
    metadata: RegistroAuditoria['metadata'];
    success: boolean;
    createdAt: string;
  }[];
}

export const getUsuario = (id: string) =>
  apiFetch<DetalheUsuario>(`/admin/users/${id}`, noStore);

export type TipoDeItem =
  | 'favoritos'
  | 'aprendidas'
  | 'quero-aprender'
  | 'anotacoes'
  | 'envios'
  | 'arquivos';

export interface ItemDoUsuario {
  id: string;
  titulo: string;
  detalhe: string | null;
  em: string | null;
  workId?: string | null;
  entityType?: string | null;
  entityId?: string | null;
}

/** O que está por trás de cada número do detalhe da conta. */
export const getItensDoUsuario = (id: string, kind: TipoDeItem, page = 1) =>
  apiFetch<{
    items: ItemDoUsuario[];
    pagination: { page: number; total: number; totalPages: number };
  }>(`/admin/users/${id}/items`, {
    query: { kind, page, limit: 20 },
    cache: 'no-store',
  });

export interface ResumoUsuarios {
  total: number;
  novos30: number;
  novosAnteriores: number;
  ativos7: number;
  ativos30: number;
  nuncaEntraram: number;
  emailVerificado: number;
  cadastroConcluido: number;
  perfilPublico: number;
  professores: number;
  administradores: number;
  usam: {
    favoritam: number;
    aprenderam: number;
    anotam: number;
    contribuem: number;
  };
  porNivel: Record<string, number>;
  porPerfil: Record<string, number>;
  pagantesPorPlano: Partial<Record<Plano, number>>;
}

export const getResumoUsuarios = () =>
  apiFetch<ResumoUsuarios>('/admin/users/overview', noStore);
