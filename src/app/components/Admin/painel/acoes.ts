/**
 * A trilha em português: `work.update` vira "editou a obra", `isVerified`
 * vira "verificada".
 *
 * A lista vem dos `@Audited()` da API (29/09/2026). Ação nova sem frase aqui
 * não some: cai no `fraseGenerica`, que monta a partir do verbo final
 * (`create`, `update`, `delete`…) e do tipo da entidade — e, no pior caso,
 * mostra o código cru, que ainda é informação.
 */

const FRASES: Record<string, string> = {
  'user.update': 'alterou a conta de',
  'user.role.set': 'mudou o papel de',
  'user.delete': 'apagou a conta de',
  'user.export': 'exportou a base de usuários',

  'composer.update': 'editou o compositor',
  'composer.delete': 'apagou o compositor',
  'composer.verifyBulk': 'verificou compositores em lote',
  'work.update': 'editou a obra',
  'work.delete': 'apagou a obra',
  'work.media.update': 'trocou a mídia da obra',
  'work.media.clear': 'tirou a mídia da obra',
  'score.update': 'editou a partitura',
  'upload.composer.update': 'editou o compositor enviado',
  'upload.composer.delete': 'apagou o compositor enviado',
  'upload.work.update': 'editou a obra enviada',
  'upload.work.delete': 'apagou a obra enviada',
  'upload.score.update': 'editou a partitura enviada',
  'upload.score.delete': 'apagou a partitura enviada',

  'moderation.resolve': 'resolveu a denúncia',
  'moderation.resolveMany': 'resolveu denúncias em lote',

  'blog.article.create': 'criou o artigo',
  'blog.article.update': 'editou o artigo',
  'blog.article.delete': 'apagou o artigo',
  'blog.article.publish': 'publicou o artigo',
  'blog.article.approve': 'aprovou o artigo',
  'blog.article.duplicate': 'duplicou o artigo',
  'blog.article.feature': 'destacou o artigo',
  'blog.article.restore': 'restaurou uma versão do artigo',
  'blog.featured.reorder': 'reordenou os destaques do blog',
  'blog.category.create': 'criou a categoria',
  'blog.category.update': 'editou a categoria',
  'blog.category.delete': 'apagou a categoria',
  'blog.category.reorder': 'reordenou as categorias',
  'blog.category.image': 'trocou a imagem da categoria',
  'blog.category.image.remove': 'tirou a imagem da categoria',
  'blog.tag.create': 'criou a tag',
  'blog.tag.update': 'editou a tag',
  'blog.tag.delete': 'apagou a tag',
  'blog.comment.moderate': 'moderou o comentário',
  'blog.comment.delete': 'apagou o comentário',
  'blog.media.create': 'adicionou mídia ao blog',
  'blog.media.update': 'editou a mídia do blog',
  'blog.media.delete': 'apagou a mídia do blog',
  'blog.media.upload': 'enviou uma imagem ao blog',
  'blog.media.upload.remove': 'apagou uma imagem do blog',
  'blog.media.gallery.delete': 'limpou imagens da galeria do blog',
  'blog.tts.delete': 'apagou o áudio narrado do artigo',
  'blog.event.create': 'criou o evento',
  'blog.event.update': 'editou o evento',
  'blog.event.delete': 'apagou o evento',
  'blog.venue.create': 'criou o local',
  'blog.venue.update': 'editou o local',
  'blog.venue.delete': 'apagou o local',
  'blog.calendar.bulk-insert': 'importou eventos na agenda',

  'coupon.create': 'criou o cupom',
  'coupon.update': 'editou o cupom',
  'coupon.toggle': 'ativou ou desativou o cupom',
  'coupon.delete': 'apagou o cupom',
  'coupon.sync': 'enviou ao Stripe o cupom',
  'plan-pricing.set': 'definiu o preço do plano',
  'plan-pricing.update': 'alterou o preço do plano',
  'plan-pricing.push': 'enviou ao Stripe o preço do plano',
  'plan-pricing.pull': 'trouxe do Stripe o preço do plano',

  'ad.create': 'criou o anúncio',
  'ad.update': 'editou o anúncio',
  'ad.delete': 'apagou o anúncio',
  'ad.clone': 'duplicou o anúncio',
  'ad.media.attach': 'anexou mídia ao anúncio',
  'ad.media.remove': 'tirou a mídia do anúncio',

  'newsletter.campaign.create': 'criou a campanha',
  'newsletter.campaign.update': 'editou a campanha',
  'newsletter.campaign.delete': 'apagou a campanha',
  'newsletter.campaign.send': 'disparou a campanha',
  'newsletter.campaign.test': 'enviou um teste da campanha',
  'newsletter.campaign.cancel': 'cancelou a campanha',
  'newsletter.subscriber.update': 'editou o assinante',
  'newsletter.subscriber.remove': 'descadastrou o assinante',
  'newsletter.subscribers.export': 'exportou os assinantes da newsletter',
  'newsletter.template.create': 'criou o modelo de e-mail',
  'newsletter.template.update': 'editou o modelo de e-mail',
  'newsletter.template.bulkDelete': 'apagou modelos de e-mail em lote',
  'newsletter.testList.create': 'criou a lista de teste',
  'newsletter.testList.update': 'editou a lista de teste',
  'newsletter.testList.delete': 'apagou a lista de teste',
  'newsletter.analytics.export': 'exportou os números da newsletter',

  'report.generate': 'gerou o relatório',
  'report.download': 'baixou o relatório',
  'report.delete': 'apagou o relatório',
  'audit.export': 'exportou a auditoria',

  'backup.download': 'baixou um backup',
  'backup.settings.update': 'mudou a configuração do backup',
  'maintenance.task.run': 'rodou a tarefa',
  'maintenance.schedule.set': 'agendou a tarefa',
  'maintenance.schedule.remove': 'tirou o agendamento da tarefa',
  'job.cancel': 'cancelou o job',

  'database.records.read': 'leu registros no Database Studio',
  'database.record.create.attempt': 'criou um registro no banco',
  'database.record.update.attempt': 'alterou um registro no banco',
  'database.record.delete.attempt': 'apagou registros no banco',
  'database.export': 'exportou registros do banco',
  'database.models.list': 'abriu o Database Studio',
  'audit.purge': 'apagou registros da auditoria',
  'task-run.delete': 'apagou execuções do histórico de tarefas',
  'storage.orphan.delete': 'removeu arquivos órfãos',
  'scraper.import': 'importou eventos escolhidos da prévia',
  'database.schema.read': 'leu a estrutura de um model',

  'scraper.run': 'rodou o scraper',
  'scraper.run-all': 'rodou todos os scrapers',
  'scraper.schedule.set': 'agendou o scraper',
  'scraper.schedule.remove': 'tirou o agendamento do scraper',
  'imslp.composer.discover': 'buscou compositores no IMSLP',
  'imslp.composer.scrape': 'importou o compositor do IMSLP',
  'imslp.work.scrape': 'importou a obra do IMSLP',
  'imslp.works.import': 'importou obras do IMSLP',
  'wikipedia.composer.scrape': 'importou a biografia da Wikipedia',
};

const VERBOS: Record<string, string> = {
  create: 'criou',
  update: 'editou',
  delete: 'apagou',
  remove: 'removeu',
  set: 'definiu',
  toggle: 'alternou',
  export: 'exportou',
  import: 'importou',
  send: 'enviou',
  cancel: 'cancelou',
  approve: 'aprovou',
  reject: 'recusou',
  publish: 'publicou',
  run: 'rodou',
  download: 'baixou',
};

const ENTIDADES: Record<string, string> = {
  user: 'a conta',
  composer: 'o compositor',
  work: 'a obra',
  workScore: 'a partitura',
  uploadModeration: 'a denúncia',
  generatedReport: 'o relatório',
  advertisement: 'o anúncio',
  subscriber: 'o assinante',
  template: 'o modelo',
  campaign: 'a campanha',
  testList: 'a lista de teste',
  'blog-article': 'o artigo',
  'blog-category': 'a categoria',
  'blog-tag': 'a tag',
  'blog-media': 'a mídia',
  'blog-comment': 'o comentário',
  coupon: 'o cupom',
  planPricing: 'o preço',
  venue: 'o local',
  event: 'o evento',
  scraper: 'o scraper',
  maintenanceTask: 'a tarefa',
  job: 'o job',
  backup: 'o backup',
  'backup-settings': 'o backup',
  databaseRecord: 'o registro',
};

/** O tipo da entidade em português, para filtro e detalhe. */
export const NOME_ENTIDADE: Record<string, string> = {
  user: 'Conta',
  composer: 'Compositor',
  work: 'Obra',
  workScore: 'Partitura',
  uploadModeration: 'Denúncia',
  generatedReport: 'Relatório',
  advertisement: 'Anúncio',
  subscriber: 'Assinante da newsletter',
  template: 'Modelo de e-mail',
  campaign: 'Campanha',
  testList: 'Lista de teste',
  'blog-article': 'Artigo',
  'blog-category': 'Categoria do blog',
  'blog-tag': 'Tag do blog',
  'blog-media': 'Mídia do blog',
  'blog-comment': 'Comentário',
  coupon: 'Cupom',
  planPricing: 'Preço de plano',
  venue: 'Local',
  event: 'Evento',
  scraper: 'Scraper',
  maintenanceTask: 'Tarefa de manutenção',
  job: 'Job',
  backup: 'Backup',
  'backup-settings': 'Configuração do backup',
  databaseRecord: 'Registro do banco',
  adminAuditLog: 'Auditoria',
};

function fraseGenerica(action: string, entityType: string | null): string {
  const verbo = VERBOS[action.split('.').pop() ?? ''];
  const alvo = entityType ? ENTIDADES[entityType] : undefined;
  if (verbo && alvo) return `${verbo} ${alvo}`;
  if (verbo) return `${verbo} (${action})`;
  return `fez ${action}`;
}

export function fraseDaAcao(action: string, entityType: string | null): string {
  return FRASES[action] ?? fraseGenerica(action, entityType);
}

/** A área da ação, para agrupar o filtro: `blog.article.update` → blog. */
export const AREAS_DE_ACAO: { prefixo: string; rotulo: string }[] = [
  { prefixo: 'user', rotulo: 'Contas' },
  { prefixo: 'composer', rotulo: 'Compositores' },
  { prefixo: 'work', rotulo: 'Obras' },
  { prefixo: 'score', rotulo: 'Partituras' },
  { prefixo: 'upload', rotulo: 'Envios' },
  { prefixo: 'moderation', rotulo: 'Denúncias' },
  { prefixo: 'blog', rotulo: 'Blog' },
  { prefixo: 'newsletter', rotulo: 'Newsletter' },
  { prefixo: 'coupon', rotulo: 'Cupons' },
  { prefixo: 'plan-pricing', rotulo: 'Preços' },
  { prefixo: 'ad', rotulo: 'Anúncios' },
  { prefixo: 'report', rotulo: 'Relatórios' },
  { prefixo: 'backup', rotulo: 'Backup' },
  { prefixo: 'maintenance', rotulo: 'Manutenção' },
  { prefixo: 'database', rotulo: 'Database Studio' },
  { prefixo: 'scraper', rotulo: 'Scrapers' },
  { prefixo: 'imslp', rotulo: 'IMSLP' },
  { prefixo: 'wikipedia', rotulo: 'Wikipedia' },
  { prefixo: 'job', rotulo: 'Jobs' },
  { prefixo: 'audit', rotulo: 'Auditoria' },
];

const CAMPOS: Record<string, string> = {
  title: 'título',
  name: 'nome',
  fullName: 'nome completo',
  firstName: 'nome',
  lastName: 'sobrenome',
  email: 'e-mail',
  username: 'usuário',
  role: 'papel',
  isTeacher: 'professor',
  isVerified: 'verificada',
  verified: 'verificada',
  status: 'estado',
  price: 'preço',
  isActive: 'ativo',
  code: 'código',
  discountValue: 'desconto',
  monthlyPrice: 'preço mensal',
  yearlyPrice: 'preço anual',
  validFrom: 'válido desde',
  validUntil: 'válido até',
  maxUses: 'usos máximos',
  description: 'descrição',
  content: 'conteúdo',
  slug: 'endereço',
  subject: 'assunto',
  scheduledAt: 'agendada para',
  type: 'tipo',
  priority: 'prioridade',
  reason: 'motivo',
  resolution: 'resolução',
  moderationNotes: 'notas da moderação',
  catalogNumber: 'catálogo',
  opus: 'opus',
  year: 'ano',
  compositionYear: 'ano',
  composerId: 'compositor',
  epochId: 'época',
  genreId: 'gênero',
  difficulty: 'dificuldade',
  planType: 'plano',
  billingPeriod: 'período',
  youtubeUrl: 'vídeo',
  spotifyUrl: 'Spotify',
  imageUrl: 'imagem',
  image: 'imagem',
  isFeatured: 'destaque',
  publishedAt: 'publicado em',
  qualityScore: 'qualidade',
  userId: 'conta',
  workId: 'obra',
  trialEndDate: 'fim do teste',
  cancelledAt: 'cancelada em',
  createdAt: 'criado em',
  updatedAt: 'atualizado em',
  endDate: 'vence em',
  startDate: 'início',
  entityType: 'tipo',
  count: 'quantidade',
  total: 'total',
  plano: 'plano',
  assinaturas: 'assinaturas',
  composer: 'compositor',
  work: 'obra',
  students: 'alunos',
  lessons: 'aulas',
  dueDate: 'prazo',
};

export const nomeDoCampo = (campo: string) => CAMPOS[campo] ?? campo;

/** Um valor de mudança em texto curto. */
export function valorLegivel(valor: unknown): string {
  if (valor === null || valor === undefined || valor === '') return 'vazio';
  if (valor === true) return 'sim';
  if (valor === false) return 'não';
  if (typeof valor === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(valor)) {
    return new Date(valor).toLocaleString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'America/Sao_Paulo',
    });
  }
  if (typeof valor === 'object') return JSON.stringify(valor);
  return String(valor);
}

/** O papel do token (texto "0", "1", "2") como a tela fala. */
export const nomeDoPapel = (papel: string | null) =>
  papel === '2'
    ? 'administrador'
    : papel === '1'
      ? 'professor'
      : papel === '0'
        ? 'pessoa'
        : null;
