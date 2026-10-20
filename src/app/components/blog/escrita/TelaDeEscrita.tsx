'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
  type ReactNode,
} from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import {
  PiArrowLeft,
  PiCaretDown,
  PiCopy,
  PiEye,
  PiImage,
  PiTrash,
  PiUploadSimple,
  PiX,
  PiTranslate,
} from 'react-icons/pi';
import ConfirmModal from '@/app/components/ConfirmModal';
import { Cabecalho } from '@/app/components/Admin/painel/Cabecalho';
import type { Opcao } from '@/app/components/Admin/painel/Escolher';
import { Interruptor } from '@/app/components/Admin/painel/Campos';
import { Chip } from '@/app/components/ui/Badge';
import { Button, classesDeBotao } from '@/app/components/ui/Button';
import { CampoDeFichas } from '@/app/components/ui/CampoDeFichas';
import { Erro } from '@/app/components/ui/Estados';
import { Field } from '@/app/components/ui/Field';
import { Icon } from '@/app/components/ui/Icon';
import { Selecao } from '@/app/components/ui/Selecao';
import { Sheet } from '@/app/components/ui/Sheet';
import { Skeleton } from '@/app/components/ui/Skeleton';
import { cx } from '@/app/components/ui/cx';
import { Capa } from '@/app/components/blog/site/Capa';
import { CorpoDoArtigo } from '@/app/components/blog/site/CorpoDoArtigo';
import { ArticleStatus, ArticleType } from '@/app/types/blog';
import {
  createArticle,
  deleteArticle,
  duplicateArticle,
  loadArticleForEdit,
  loadFeaturedArticles,
  reorderFeaturedArticles,
  translateTexts,
  updateArticle,
  createMyArticle,
  updateMyArticle,
  type ArticleFormValues,
  type ArticleTranslationValues,
  type FeaturedEntry,
} from '@/app/requests/blog/admin-actions';
import {
  removeBlogMedia,
  uploadBlogMedia,
} from '@/app/requests/blog/interactions';
import {
  listarCategorias,
  type CategoriaDoBlog,
} from '@/app/requests/blog/leitura';
import { findComposerById, getWorkById } from '@/app/requests/catalog-search';
import { rotasDoBlog } from '@/app/utils/blog/rotas';
import { LIMITES } from '@/app/utils/blog/seo';
import { minutosDeLeitura } from '@/app/utils/blog/tiptap';
import { AssistenteDeSeo } from './AssistenteDeSeo';
import { BuscaNoAcervo, type ItemDoAcervo } from './BuscaNoAcervo';
import { Aba, Abas } from '@/app/components/ui/Abas';
import { textosDoDocumento } from '@/app/utils/blog/traducao';

// O editor (TipTap) e o recorte de capa só carregam nesta tela.
const BlogEditor = dynamic(
  () =>
    import('@/app/components/blog/editor/BlogEditor').then((m) => m.BlogEditor),
  {
    ssr: false,
    loading: () => <Skeleton className="h-[28rem] w-full rounded-card" />,
  }
);
const CoverCropper = dynamic(
  () => import('@/app/components/blog/CoverCropper'),
  {
    ssr: false,
  }
);

/**
 * Escrever e editar artigo — a mesa de escrita do blog.
 *
 * **Uma página, não um assistente de quatro abas.** O formulário antigo
 * escondia SEO e vínculos em abas que quase ninguém abria, com "Próximo" e
 * "Voltar" entre elas. Aqui o texto ocupa a coluna principal (título,
 * resumo, editor) e tudo o que é sobre o texto fica ao lado, à vista:
 * publicação, SEO, capa, classificação, vínculos com a enciclopédia, música.
 *
 * **SEO com dicas, não com campos obrigatórios.** O blog gera um SEO bom
 * sozinho a partir do artigo; o assistente mostra o que o buscador vai ver
 * e o que dá para melhorar.
 *
 * Ctrl S salva. Sair com alteração não salva pede confirmação.
 */

type Estado = (typeof ArticleStatus)[keyof typeof ArticleStatus];

const TIPOS: Record<string, string> = {
  [ArticleType.COMPOSER_ANALYSIS]: 'Análise de compositor',
  [ArticleType.WORK_ANALYSIS]: 'Análise de obra',
  [ArticleType.INSTRUMENT_GUIDE]: 'Guia de instrumento',
  [ArticleType.MUSIC_HISTORY]: 'História da música',
  [ArticleType.TUTORIAL]: 'Tutorial',
  [ArticleType.TOP_LIST]: 'Lista',
  [ArticleType.INTERVIEW]: 'Entrevista',
  [ArticleType.NEWS]: 'Notícia',
  [ArticleType.CURIOSITY]: 'Curiosidades',
  [ArticleType.PERFORMANCE_VIDEO]: 'Vídeo de performance',
  [ArticleType.CONCERT_GUIDE]: 'Guia de concerto',
  [ArticleType.GENERAL]: 'Geral',
};

const ESTADOS: Array<{ value: Estado; label: string }> = [
  { value: 'DRAFT', label: 'Rascunho' },
  { value: 'REVIEW', label: 'Em revisão' },
  { value: 'SCHEDULED', label: 'Agendado' },
  { value: 'PUBLISHED', label: 'Publicado' },
];

const MAX_DESTAQUES = 5;

interface Valores extends ArticleFormValues {
  status: Estado;
  language: Lingua;
  translation: ArticleTranslationValues;
}

const VAZIO: Valores = {
  title: '',
  slug: '',
  description: '',
  content: { type: 'doc', content: [] },
  coverImage: '',
  coverImageAlt: '',
  coverImageCredit: '',
  status: 'DRAFT',
  isFeatured: false,
  featuredOrder: null,
  types: [],
  categoryIds: [],
  tags: [],
  composerIds: [],
  workIds: [],
  scoreIds: [],
  instrumentIds: [],
  epochIds: [],
  backgroundMusic: {
    url: '',
    title: '',
    volume: 0.3,
    loop: true,
    autoplay: false,
  },
  metaTitle: '',
  metaDescription: '',
  keywords: [],
  scheduledFor: '',
  readTime: 0,
  language: 'pt',
  translation: {
    title: '',
    description: '',
    content: { type: 'doc', content: [] },
    metaTitle: '',
    metaDescription: '',
    coverImageAlt: '',
  },
};

type Lingua = 'pt' | 'en';
const NOME_DA_LINGUA: Record<Lingua, string> = {
  pt: 'Português',
  en: 'English',
};

export const paraSlug = (texto: string) =>
  texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);

function doArtigo(a: Record<string, any>): Valores {
  return {
    ...VAZIO,
    title: a.title ?? '',
    slug: a.slug ?? '',
    description: a.description ?? '',
    content: a.content ?? VAZIO.content,
    coverImage: a.coverImage ?? '',
    coverImageAlt: a.coverImageAlt ?? '',
    coverImageCredit: a.coverImageCredit ?? '',
    status: (a.status as Estado) ?? 'DRAFT',
    isFeatured: !!a.isFeatured,
    featuredOrder: a.featuredOrder ?? null,
    types: a.types ?? [],
    categoryIds: (a.categories ?? [])
      .map((c: any) => c.id ?? c.category?.id)
      .filter(Boolean),
    tags: (a.tags ?? []).map((t: any) => t.name ?? t.tag?.name).filter(Boolean),
    composerIds: a.composerIds ?? [],
    workIds: a.workIds ?? [],
    scoreIds: a.scoreIds ?? [],
    instrumentIds: a.instrumentIds ?? [],
    epochIds: a.epochIds ?? [],
    backgroundMusic: {
      url: a.backgroundMusic?.url ?? a.backgroundMusicUrl ?? '',
      title: a.backgroundMusic?.title ?? a.backgroundMusicTitle ?? '',
      volume: a.backgroundMusic?.volume ?? a.backgroundMusicVolume ?? 0.3,
      loop: a.backgroundMusic?.loop ?? a.backgroundMusicLoop ?? true,
      // A música nunca começa sozinha (WCAG 1.4.2): o campo existe na API,
      // mas o blog não o honra mais.
      autoplay: false,
    },
    metaTitle: a.metaTitle ?? '',
    metaDescription: a.metaDescription ?? '',
    keywords: a.keywords ?? [],
    scheduledFor: a.scheduledFor ? toLocalInput(a.scheduledFor) : '',
    readTime: a.readTime ?? 0,
    language: a.language === 'en' ? 'en' : 'pt',
    translation: {
      ...VAZIO.translation,
      title: a.translation?.title ?? '',
      description: a.translation?.description ?? '',
      content: a.translation?.content ?? VAZIO.translation.content,
      metaTitle: a.translation?.metaTitle ?? '',
      metaDescription: a.translation?.metaDescription ?? '',
      coverImageAlt: a.translation?.coverImageAlt ?? '',
    },
  };
}

/** ISO → o valor que um `datetime-local` aceita, no fuso de quem edita. */
function toLocalInput(iso: string) {
  const d = new Date(iso);
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}

export function TelaDeEscrita({
  artigoId,
  modo = 'admin',
}: {
  artigoId?: string;
  /**
   * `autor`: professor escrevendo fora do painel (01/10). Sem destaque, sem
   * agendar, sem apagar; "Publicar" vira "Enviar para revisão" e quem
   * publica é o administrador. Grava pela rota `blog/my-articles`.
   */
  modo?: 'admin' | 'autor';
}) {
  const router = useRouter();
  const editando = !!artigoId;
  const autor = modo === 'autor';
  const rotaDeEditar = (id: string) =>
    autor ? rotasDoBlog.editarComoAutor(id) : rotasDoBlog.editar(id);
  const rotaDeVolta = autor ? rotasDoBlog.meusArtigos() : rotasDoBlog.painel();

  const [valores, setValores] = useState<Valores>(VAZIO);
  const [original, setOriginal] = useState<string>(JSON.stringify(VAZIO));
  const [categorias, setCategorias] = useState<CategoriaDoBlog[]>([]);
  const [destaques, setDestaques] = useState<FeaturedEntry[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [falhou, setFalhou] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erros, setErros] = useState<Record<string, string>>({});
  const [slugManual, setSlugManual] = useState(editando);
  const [previa, setPrevia] = useState(false);
  const [apagando, setApagando] = useState(false);
  const [recorte, setRecorte] = useState<{ src: string; nome: string } | null>(
    null
  );
  const [enviandoCapa, setEnviandoCapa] = useState(false);
  const [enviandoAudio, setEnviandoAudio] = useState(false);
  const [compositores, setCompositores] = useState<Opcao[]>([]);
  const [obras, setObras] = useState<Opcao[]>([]);
  const [filtroDeObras, setFiltroDeObras] = useState<string | null>(null);
  const [aba, setAba] = useState<'original' | 'traducao'>('original');
  const [traduzindo, setTraduzindo] = useState(false);
  // Muda quando a tradução automática troca o texto: o editor remonta com ele.
  const [versaoDaTraducao, setVersaoDaTraducao] = useState(0);
  const [sessao] = useState(
    () => `session-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
  );
  const inicial = useRef<Valores | null>(null);

  const mudou = JSON.stringify(valores) !== original;

  const mudar = useCallback(
    <K extends keyof Valores>(campo: K, valor: Valores[K]) => {
      setValores((v) => ({ ...v, [campo]: valor }));
      setErros((e) => (e[campo as string] ? { ...e, [campo]: '' } : e));
    },
    []
  );

  const mudarTraducao = useCallback(
    <K extends keyof ArticleTranslationValues>(
      campo: K,
      valor: ArticleTranslationValues[K]
    ) =>
      setValores((v) => ({
        ...v,
        translation: { ...v.translation, [campo]: valor },
      })),
    []
  );

  const outra: Lingua = valores.language === 'pt' ? 'en' : 'pt';

  /**
   * Preenche a aba da tradução com a tradução automática do original:
   * título, resumo, SEO, descrição da capa e o texto (só as palavras; a
   * estrutura do editor fica igual — ver `utils/blog/traducao`). Substitui o
   * que estiver na aba: quem escreve revisa depois.
   */
  async function traduzirAutomaticamente() {
    const doc = textosDoDocumento(valores.content);
    const soltos = [
      valores.title,
      valores.description ?? '',
      valores.metaTitle ?? '',
      valores.metaDescription ?? '',
      valores.coverImageAlt ?? '',
    ];
    setTraduzindo(true);
    try {
      const saida = await translateTexts(
        [...soltos, ...doc.textos],
        valores.language,
        outra
      );
      const [title, description, metaTitle, metaDescription, coverImageAlt] =
        saida;
      setValores((v) => ({
        ...v,
        translation: {
          title,
          description,
          metaTitle,
          metaDescription,
          coverImageAlt,
          content: doc.aplicar(saida.slice(soltos.length)),
        },
      }));
      setVersaoDaTraducao((n) => n + 1);
      toast.success('Tradução pronta. Revise antes de salvar.');
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : 'Não deu para traduzir agora.'
      );
    } finally {
      setTraduzindo(false);
    }
  }

  // ---------------------------------------------------------------------
  // Carregar
  // ---------------------------------------------------------------------

  const carregar = useCallback(async () => {
    setCarregando(true);
    setFalhou(false);
    try {
      const [cats, destaquesAtuais, artigo] = await Promise.all([
        listarCategorias({ fresh: true }),
        autor ? Promise.resolve([]) : loadFeaturedArticles().catch(() => []),
        artigoId ? loadArticleForEdit(artigoId) : Promise.resolve(null),
      ]);
      setCategorias(cats);
      setDestaques(destaquesAtuais);
      const v = artigo ? doArtigo(artigo) : VAZIO;
      inicial.current = v;
      setValores(v);
      setOriginal(JSON.stringify(v));
    } catch {
      setFalhou(true);
    } finally {
      setCarregando(false);
    }
  }, [artigoId]);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  // Os nomes dos compositores e obras já ligados ao artigo.
  useEffect(() => {
    if (!inicial.current) return;
    const { composerIds, workIds } = inicial.current;
    void Promise.all(
      composerIds.map((id) => findComposerById(id).catch(() => null))
    ).then((lista) =>
      setCompositores(
        lista.filter(Boolean).map((c) => ({
          id: c!.id,
          rotulo: c!.name,
          detalhe: c!.epochName ?? null,
        }))
      )
    );
    void Promise.all(
      workIds.map((id) => getWorkById(id).catch(() => null))
    ).then((lista) =>
      setObras(
        lista.filter(Boolean).map((o) => ({
          id: o!.id,
          rotulo: o!.title,
          detalhe: o!.composer?.name ?? null,
        }))
      )
    );
  }, [carregando]);

  // Sair com alteração não salva pede confirmação.
  useEffect(() => {
    if (!mudou) return;
    const aviso = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener('beforeunload', aviso);
    return () => window.removeEventListener('beforeunload', aviso);
  }, [mudou]);

  // ---------------------------------------------------------------------
  // Salvar
  // ---------------------------------------------------------------------

  function validar(v: Valores) {
    const e: Record<string, string> = {};
    if (v.title.trim().length < 3)
      e.title = 'Escreva um título com ao menos 3 letras.';
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(v.slug))
      e.slug =
        'Use letras minúsculas, números e hífens (ex.: oferenda-musical).';
    if (v.status === 'SCHEDULED' && !v.scheduledFor)
      e.scheduledFor = 'Escolha a data e a hora da publicação.';
    if (v.coverImage && !v.coverImageAlt?.trim())
      e.coverImageAlt = 'Descreva a capa: é o que o leitor de tela lê.';
    setErros(e);
    return Object.keys(e).length === 0;
  }

  async function salvar(estado?: Estado) {
    const v: Valores = { ...valores, ...(estado ? { status: estado } : {}) };
    if (!validar(v)) {
      toast.error('Confira os campos marcados.');
      return;
    }
    setSalvando(true);
    try {
      const corpo: Valores = {
        ...v,
        readTime: v.readTime || minutosDeLeitura(v.content),
        backgroundMusic: { ...v.backgroundMusic, autoplay: false },
      };
      const r = autor
        ? editando
          ? await updateMyArticle(artigoId!, corpo)
          : await createMyArticle(corpo)
        : editando
          ? await updateArticle(artigoId!, corpo)
          : await createArticle(corpo);
      const id = editando ? artigoId! : r.article?.id;

      // Destaque: a posição escolhida empurra os outros uma casa.
      if (id && v.isFeatured && typeof v.featuredOrder === 'number') {
        const outros = destaques
          .filter((d) => d.id !== id)
          .sort((a, b) => a.featuredOrder - b.featuredOrder);
        outros.splice(v.featuredOrder - 1, 0, {
          id,
          title: v.title,
          featuredOrder: v.featuredOrder,
        });
        await reorderFeaturedArticles(
          outros
            .slice(0, MAX_DESTAQUES)
            .map((d, i) => ({ id: d.id, featuredOrder: i + 1 }))
        ).catch(() => undefined);
      }

      setValores(v);
      setOriginal(JSON.stringify(v));
      toast.success(
        v.status === 'PUBLISHED'
          ? 'Artigo publicado.'
          : editando
            ? 'Alterações salvas.'
            : 'Artigo criado.'
      );
      if (!editando && id) router.replace(rotaDeEditar(id));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Não foi possível salvar.');
    } finally {
      setSalvando(false);
    }
  }

  // Ctrl S / ⌘S salva.
  const salvarRef = useRef(salvar);
  salvarRef.current = salvar;
  useEffect(() => {
    const atalho = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        void salvarRef.current();
      }
    };
    document.addEventListener('keydown', atalho);
    return () => document.removeEventListener('keydown', atalho);
  }, []);

  async function apagar() {
    if (!artigoId) return;
    try {
      await deleteArticle(artigoId);
      setOriginal(JSON.stringify(valores));
      toast.success('Artigo apagado.');
      router.push(rotaDeVolta);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Não foi possível apagar.');
    } finally {
      setApagando(false);
    }
  }

  async function duplicar() {
    if (!artigoId) return;
    try {
      const r = (await duplicateArticle(artigoId)) as {
        article?: { id: string };
      };
      toast.success('Cópia criada como rascunho.');
      if (r?.article?.id) router.push(rotaDeEditar(r.article.id));
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : 'Não foi possível duplicar.'
      );
    }
  }

  // ---------------------------------------------------------------------
  // Capa e áudio
  // ---------------------------------------------------------------------

  function escolherCapa(e: ChangeEvent<HTMLInputElement>) {
    const arquivo = e.target.files?.[0];
    e.target.value = '';
    if (!arquivo) return;
    if (!arquivo.type.startsWith('image/'))
      return toast.error('Escolha uma imagem (JPG, PNG ou WebP).');
    if (arquivo.size > 10 * 1024 * 1024)
      return toast.error('A imagem passa de 10 MB.');
    const leitor = new FileReader();
    leitor.onload = () =>
      setRecorte({ src: leitor.result as string, nome: arquivo.name });
    leitor.readAsDataURL(arquivo);
  }

  async function enviarCapa(recortada: Blob) {
    const nome = recorte?.nome ?? 'capa.jpg';
    setRecorte(null);
    setEnviandoCapa(true);
    try {
      const url = await uploadBlogMedia(recortada, {
        folder: 'thumbnail',
        articleId: artigoId,
        sessionId: sessao,
        fileName: nome,
      });
      mudar('coverImage', url);
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : 'Não foi possível enviar a capa.'
      );
    } finally {
      setEnviandoCapa(false);
    }
  }

  async function tirarCapa() {
    const url = valores.coverImage;
    mudar('coverImage', '');
    if (url) await removeBlogMedia(url).catch(() => undefined);
  }

  async function enviarAudio(e: ChangeEvent<HTMLInputElement>) {
    const arquivo = e.target.files?.[0];
    e.target.value = '';
    if (!arquivo) return;
    if (!/^audio\/(mpeg|mp3|wav|ogg)$/.test(arquivo.type))
      return toast.error('Use MP3, WAV ou OGG.');
    if (arquivo.size > 10 * 1024 * 1024)
      return toast.error('O áudio passa de 10 MB.');
    setEnviandoAudio(true);
    try {
      const url = await uploadBlogMedia(arquivo, {
        folder: 'audio',
        articleId: artigoId,
        sessionId: sessao,
      });
      mudar('backgroundMusic', {
        ...valores.backgroundMusic,
        url,
        title:
          valores.backgroundMusic?.title ||
          arquivo.name.replace(/\.[^.]+$/, ''),
      });
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : 'Não foi possível enviar o áudio.'
      );
    } finally {
      setEnviandoAudio(false);
    }
  }

  // ---------------------------------------------------------------------

  const minutos = valores.readTime || minutosDeLeitura(valores.content);

  const paraSeo = useMemo(
    () => ({
      titulo: valores.title,
      slug: valores.slug,
      resumo: valores.description ?? '',
      conteudo: valores.content,
      capa: valores.coverImage ?? '',
      capaAlt: valores.coverImageAlt ?? '',
      metaTitulo: valores.metaTitle ?? '',
      metaDescricao: valores.metaDescription ?? '',
      palavrasChave: valores.keywords,
      categorias: valores.categoryIds.length,
      tags: valores.tags.length,
    }),
    [valores]
  );

  const posicoes = Math.min(
    MAX_DESTAQUES,
    destaques.filter((d) => d.id !== artigoId).length + 1
  );

  if (falhou) {
    return (
      <Erro
        titulo="Não foi possível abrir o artigo"
        descricao="A API não respondeu. Nada foi alterado."
        acao={<Button onClick={carregar}>Tentar de novo</Button>}
      />
    );
  }

  if (carregando) {
    return (
      <div className="flex flex-col gap-6" aria-busy="true">
        <Skeleton className="h-10 w-72" />
        <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_24rem]">
          <Skeleton className="h-[34rem] w-full rounded-card" />
          <Skeleton className="h-[34rem] w-full rounded-card" />
        </div>
      </div>
    );
  }

  const estadoAtual = ESTADOS.find((e) => e.value === valores.status)?.label;

  return (
    <form
      onSubmit={(e: FormEvent) => {
        e.preventDefault();
        void salvar();
      }}
      className="flex flex-col gap-6"
    >
      <Link
        href={rotaDeVolta}
        className="t-rotulo inline-flex min-h-[var(--alvo)] items-center gap-2 self-start text-texto-fraco hover:text-texto"
      >
        <Icon de={PiArrowLeft} tamanho="pp" />
        {autor ? 'Meus artigos' : 'Artigos'}
      </Link>

      <Cabecalho
        titulo={editando ? 'Editar artigo' : 'Novo artigo'}
        descricao={
          <>
            {estadoAtual}
            {mudou
              ? ' · alterações não salvas'
              : editando
                ? ' · tudo salvo'
                : ''}
            {' · Ctrl S salva'}
          </>
        }
        aoAtualizar={false}
        acoes={
          <>
            <Button
              tamanho="p"
              variante="fantasma"
              icone={PiEye}
              onClick={() => setPrevia(true)}
            >
              Pré-visualizar
            </Button>
            {editando && valores.slug && (
              <Link
                href={
                  valores.status === 'PUBLISHED'
                    ? rotasDoBlog.artigo(valores.slug)
                    : rotasDoBlog.previa(valores.slug)
                }
                target="_blank"
                className={classesDeBotao('fantasma', 'p')}
              >
                {valores.status === 'PUBLISHED'
                  ? 'Ver no blog'
                  : 'Abrir a prévia'}
              </Link>
            )}
            <Button
              tamanho="p"
              type="submit"
              carregando={salvando && valores.status !== 'PUBLISHED'}
            >
              {valores.status === 'PUBLISHED' ? 'Salvar' : 'Salvar rascunho'}
            </Button>
            {valores.status !== 'PUBLISHED' &&
              (autor ? (
                valores.status !== 'REVIEW' && (
                  <Button
                    tamanho="p"
                    variante="primario"
                    carregando={salvando}
                    onClick={() => salvar('REVIEW')}
                  >
                    Enviar para revisão
                  </Button>
                )
              ) : (
                <Button
                  tamanho="p"
                  variante="primario"
                  carregando={salvando}
                  onClick={() => salvar('PUBLISHED')}
                >
                  Publicar
                </Button>
              ))}
          </>
        }
      />

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_24rem]">
        {/* O texto */}
        <div className="flex min-w-0 flex-col gap-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Abas rotulo="Idioma do texto" className="self-start">
              <Aba
                ativa={aba === 'original'}
                onClick={() => setAba('original')}
              >
                {NOME_DA_LINGUA[valores.language]}
                <span className="ml-1.5 font-normal text-texto-fraco">
                  original
                </span>
              </Aba>
              <Aba
                ativa={aba === 'traducao'}
                onClick={() => setAba('traducao')}
              >
                {NOME_DA_LINGUA[outra]}
                <span className="ml-1.5 font-normal text-texto-fraco">
                  {valores.translation.title.trim()
                    ? 'tradução'
                    : 'sem tradução'}
                </span>
              </Aba>
            </Abas>
            {aba === 'traducao' && (
              <Button
                tamanho="p"
                icone={PiTranslate}
                carregando={traduzindo}
                onClick={traduzirAutomaticamente}
              >
                Traduzir do {NOME_DA_LINGUA[valores.language].toLowerCase()}
              </Button>
            )}
          </div>

          {aba === 'original' ? (
            <>
              <div className="flex flex-col gap-2">
                <label htmlFor="titulo-do-artigo" className="sr-only">
                  Título
                </label>
                <textarea
                  id="titulo-do-artigo"
                  rows={2}
                  value={valores.title}
                  onChange={(e) => {
                    mudar('title', e.target.value);
                    if (!slugManual) mudar('slug', paraSlug(e.target.value));
                  }}
                  placeholder="Título do artigo"
                  aria-invalid={erros.title ? true : undefined}
                  aria-describedby={erros.title ? 'titulo-erro' : undefined}
                  className="w-full resize-none border-0 bg-transparent font-display text-[2.25rem] leading-[1.1] tracking-[-0.015em] text-texto outline-none placeholder:text-texto-fraco sm:text-[2.75rem]"
                />
                {erros.title && (
                  <p
                    id="titulo-erro"
                    role="alert"
                    className="t-legenda text-erro"
                  >
                    {erros.title}
                  </p>
                )}
              </div>

              <Field.Area
                label="Resumo"
                ajuda={`Aparece nos cards e, sem descrição de SEO, no Google. Ideal: ${LIMITES.descricao.min} a ${LIMITES.descricao.max} caracteres (agora ${(valores.description ?? '').length}).`}
                rows={3}
                value={valores.description ?? ''}
                onChange={(e) => mudar('description', e.target.value)}
                classeCampo="resize-y"
              />

              <div className="flex flex-col gap-2">
                <p className="flex items-baseline justify-between text-sm font-medium text-texto">
                  Texto
                  <span className="t-legenda t-dado">
                    {minutos} min de leitura
                  </span>
                </p>
                <BlogEditor
                  content={valores.content}
                  onChange={(c) => mudar('content', c)}
                  articleId={artigoId}
                  sessionId={sessao}
                />
              </div>
            </>
          ) : (
            <>
              <div className="flex flex-col gap-2">
                <label htmlFor="titulo-traduzido" className="sr-only">
                  Título em {NOME_DA_LINGUA[outra]}
                </label>
                <textarea
                  id="titulo-traduzido"
                  rows={2}
                  lang={outra}
                  value={valores.translation.title}
                  onChange={(e) => mudarTraducao('title', e.target.value)}
                  placeholder={valores.title || 'Título'}
                  className="w-full resize-none border-0 bg-transparent font-display text-[2.25rem] leading-[1.1] tracking-[-0.015em] text-texto outline-none placeholder:text-texto-fraco sm:text-[2.75rem]"
                />
                <p className="t-legenda">
                  Sem título aqui, o artigo não tem versão em{' '}
                  {NOME_DA_LINGUA[outra].toLowerCase()}: o leitor vê o original,
                  com o aviso do idioma.
                </p>
              </div>
              <Field.Area
                label="Resumo"
                rows={3}
                lang={outra}
                value={valores.translation.description}
                onChange={(e) => mudarTraducao('description', e.target.value)}
                classeCampo="resize-y"
              />
              <div className="flex flex-col gap-2">
                <p className="text-sm font-medium text-texto">Texto</p>
                <BlogEditor
                  key={`traducao-${versaoDaTraducao}`}
                  content={valores.translation.content}
                  onChange={(c) => mudarTraducao('content', c)}
                  articleId={artigoId}
                  sessionId={sessao}
                />
              </div>
              <div className="grid gap-4 rounded-card bg-sup-2 p-4 sm:grid-cols-2">
                <Field
                  label="Título no Google"
                  value={valores.translation.metaTitle}
                  onChange={(e) => mudarTraducao('metaTitle', e.target.value)}
                  placeholder={valores.translation.title}
                />
                <Field
                  label="Descrição da capa"
                  value={valores.translation.coverImageAlt}
                  onChange={(e) =>
                    mudarTraducao('coverImageAlt', e.target.value)
                  }
                />
                <Field.Area
                  label="Descrição no Google"
                  rows={2}
                  value={valores.translation.metaDescription}
                  onChange={(e) =>
                    mudarTraducao('metaDescription', e.target.value)
                  }
                  className="sm:col-span-2"
                />
              </div>
            </>
          )}
        </div>

        {/* O que é sobre o texto */}
        <aside className="flex min-w-0 flex-col gap-4">
          <Grupo titulo="Publicação">
            <div className="flex flex-col gap-1.5">
              <span
                id="lingua-rotulo"
                className="text-sm font-medium text-texto"
              >
                Escrito em
              </span>
              <div
                role="group"
                aria-labelledby="lingua-rotulo"
                className="flex gap-1.5"
              >
                {(['pt', 'en'] as const).map((l) => (
                  <Chip
                    key={l}
                    selecionado={valores.language === l}
                    onClick={() => mudar('language', l)}
                  >
                    {NOME_DA_LINGUA[l]}
                  </Chip>
                ))}
              </div>
            </div>
            {autor ? (
              <p className="t-rotulo text-texto-suave">
                {valores.status === 'REVIEW'
                  ? 'Em revisão: um administrador lê e publica. Você ainda pode editar até ele publicar.'
                  : 'Rascunho. Quando terminar, envie para revisão: um administrador lê e publica.'}
              </p>
            ) : (
              <>
                <div className="flex flex-col gap-1.5">
                  <span
                    id="estado-rotulo"
                    className="text-sm font-medium text-texto"
                  >
                    Estado
                  </span>
                  <Selecao
                    aria-labelledby="estado-rotulo"
                    valor={valores.status}
                    aoMudar={(v) => mudar('status', v as Estado)}
                    opcoes={ESTADOS}
                    className="w-full"
                  />
                </div>
                {valores.status === 'SCHEDULED' && (
                  <Field
                    label="Publicar em"
                    type="datetime-local"
                    value={valores.scheduledFor ?? ''}
                    onChange={(e) => mudar('scheduledFor', e.target.value)}
                    erro={erros.scheduledFor}
                    ajuda="No seu fuso. A varredura publica no minuto marcado."
                  />
                )}
                <Interruptor
                  rotulo="Destaque no topo do blog"
                  ajuda={
                    valores.isFeatured
                      ? `Posição ${valores.featuredOrder ?? 1} de até ${MAX_DESTAQUES}.`
                      : 'Os destaques abrem o início do blog, na ordem escolhida.'
                  }
                  ligado={valores.isFeatured}
                  aoMudar={(ligado) => {
                    mudar('isFeatured', ligado);
                    mudar(
                      'featuredOrder',
                      ligado ? (valores.featuredOrder ?? posicoes) : null
                    );
                  }}
                />
                {valores.isFeatured && (
                  <div
                    role="group"
                    aria-label="Posição no destaque"
                    className="flex flex-wrap gap-2"
                  >
                    {Array.from({ length: posicoes }, (_, i) => i + 1).map(
                      (n) => (
                        <Chip
                          key={n}
                          selecionado={valores.featuredOrder === n}
                          onClick={() => mudar('featuredOrder', n)}
                        >
                          {n}º
                        </Chip>
                      )
                    )}
                  </div>
                )}
              </>
            )}
            {editando && !autor && (
              <div className="flex flex-wrap gap-2 border-t border-linha pt-3">
                <Button
                  tamanho="p"
                  variante="fantasma"
                  icone={PiCopy}
                  onClick={duplicar}
                >
                  Duplicar
                </Button>
                <Button
                  tamanho="p"
                  variante="fantasma"
                  icone={PiTrash}
                  onClick={() => setApagando(true)}
                  className="text-erro"
                >
                  Apagar
                </Button>
              </div>
            )}
          </Grupo>

          <Grupo titulo="SEO" aberto>
            <AssistenteDeSeo artigo={paraSeo} />
            <Field
              label="Endereço"
              value={valores.slug}
              onChange={(e) => {
                setSlugManual(true);
                mudar(
                  'slug',
                  paraSlug(e.target.value) +
                    (e.target.value.endsWith('-') ? '-' : '')
                );
              }}
              erro={erros.slug}
              ajuda={`/blog/${valores.slug || '...'}${editando && valores.status === 'PUBLISHED' ? ' · mudar o endereço de um artigo publicado quebra os links que já apontam para ele.' : ''}`}
            />
            <Field
              label="Título para a busca"
              value={valores.metaTitle ?? ''}
              onChange={(e) => mudar('metaTitle', e.target.value)}
              placeholder={valores.title}
              ajuda={`Opcional. Sem ele, vale o título. ${(valores.metaTitle || valores.title).length} de ${LIMITES.titulo.max}.`}
            />
            <Field.Area
              label="Descrição para a busca"
              rows={3}
              value={valores.metaDescription ?? ''}
              onChange={(e) => mudar('metaDescription', e.target.value)}
              placeholder={valores.description ?? ''}
              ajuda={`Opcional. Sem ela, vale o resumo. ${(valores.metaDescription ?? '').length} de ${LIMITES.descricao.max}.`}
            />
            <CampoDeFichas
              rotulo="Palavras-chave"
              valores={valores.keywords}
              aoMudar={(v) => mudar('keywords', v)}
              placeholder="Digite e aperte Enter"
              ajuda="Somadas às tags e à categoria no que vai para as redes e buscadores."
            />
          </Grupo>

          <Grupo titulo="Capa">
            {valores.coverImage ? (
              <div className="flex flex-col gap-3">
                <Capa
                  src={valores.coverImage}
                  alt={valores.coverImageAlt ?? ''}
                  inicial={valores.title}
                  sizes="384px"
                  className="aspect-[16/10] rounded-controle"
                />
                <div className="flex gap-2">
                  <label
                    className={cx(
                      classesDeBotao('secundario', 'p'),
                      'cursor-pointer'
                    )}
                  >
                    <Icon de={PiUploadSimple} tamanho="pp" />
                    Trocar
                    <input
                      type="file"
                      accept="image/*"
                      onChange={escolherCapa}
                      className="sr-only"
                    />
                  </label>
                  <Button
                    tamanho="p"
                    variante="fantasma"
                    icone={PiX}
                    onClick={tirarCapa}
                  >
                    Tirar
                  </Button>
                </div>
              </div>
            ) : (
              <label className="flex cursor-pointer flex-col items-center gap-2 rounded-controle bg-[var(--campo)] px-4 py-8 text-center hover:text-ouro-texto">
                <Icon de={PiImage} tamanho="g" className="text-texto-fraco" />
                <span className="text-sm font-medium">
                  {enviandoCapa ? 'Enviando…' : 'Escolher a imagem da capa'}
                </span>
                <span className="t-legenda">
                  JPG, PNG ou WebP, até 10 MB. Você recorta antes de enviar.
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={escolherCapa}
                  className="sr-only"
                  disabled={enviandoCapa}
                />
              </label>
            )}
            <Field
              label="Descrição da imagem"
              value={valores.coverImageAlt ?? ''}
              onChange={(e) => mudar('coverImageAlt', e.target.value)}
              erro={erros.coverImageAlt}
              ajuda="O que a imagem mostra, numa frase. Lido pelo leitor de tela e pelo Google Imagens."
            />
            <Field
              label="Crédito"
              value={valores.coverImageCredit ?? ''}
              onChange={(e) => mudar('coverImageCredit', e.target.value)}
              ajuda="Autor e acervo da imagem, quando houver."
            />
          </Grupo>

          <Grupo titulo="Classificação">
            <FichasDeEscolha
              rotulo="Categorias"
              opcoes={categorias.map((c) => ({ valor: c.id, rotulo: c.nome }))}
              valores={valores.categoryIds}
              aoMudar={(v) => mudar('categoryIds', v)}
              ajuda="A primeira escolhida aparece na trilha e no card."
            />
            <CampoDeFichas
              rotulo="Assuntos (tags)"
              valores={valores.tags}
              aoMudar={(v) => mudar('tags', v)}
              placeholder="Ex.: Bach, contraponto"
              ajuda="Cada assunto vira uma página. Tag nova é criada ao salvar."
            />
            <FichasDeEscolha
              rotulo="Tipo de artigo"
              opcoes={Object.entries(TIPOS).map(([valor, rotulo]) => ({
                valor,
                rotulo,
              }))}
              valores={valores.types}
              aoMudar={(v) => mudar('types', v)}
            />
          </Grupo>

          <Grupo titulo="Neste artigo">
            <p className="t-legenda">
              O que o texto cita do acervo. Aparece ao lado do artigo, com
              retrato e link.
            </p>
            <Vinculos
              rotulo="Compositores"
              itens={compositores}
              aoTirar={(id) => {
                const lista = compositores.filter((c) => c.id !== id);
                setCompositores(lista);
                mudar(
                  'composerIds',
                  lista.map((c) => c.id)
                );
                if (filtroDeObras === id) setFiltroDeObras(null);
              }}
            >
              <BuscaNoAcervo
                tipo="compositor"
                rotulo="Acrescentar compositor"
                selecionados={compositores.map((c) => c.id)}
                aoEscolher={(c) => {
                  if (compositores.some((x) => x.id === c.id)) return;
                  const lista = [
                    ...compositores,
                    { id: c.id, rotulo: c.nome, detalhe: c.detalhe },
                  ];
                  setCompositores(lista);
                  mudar(
                    'composerIds',
                    lista.map((x) => x.id)
                  );
                  setFiltroDeObras(c.id);
                }}
              />
            </Vinculos>
            <Vinculos
              rotulo="Obras"
              itens={obras}
              aoTirar={(id) => {
                const lista = obras.filter((o) => o.id !== id);
                setObras(lista);
                mudar(
                  'workIds',
                  lista.map((o) => o.id)
                );
              }}
            >
              {compositores.length > 0 ? (
                <div className="flex flex-col gap-3">
                  <div
                    role="group"
                    aria-label="Obras de qual compositor"
                    className="flex flex-wrap gap-1.5"
                  >
                    {compositores.map((c) => (
                      <Chip
                        key={c.id}
                        selecionado={
                          (filtroDeObras ?? compositores[0].id) === c.id
                        }
                        onClick={() => setFiltroDeObras(c.id)}
                      >
                        {c.rotulo.split(' ').slice(-1)[0]}
                      </Chip>
                    ))}
                  </div>
                  <BuscaNoAcervo
                    tipo="obra"
                    rotulo={`Obras de ${
                      compositores.find(
                        (c) => c.id === (filtroDeObras ?? compositores[0].id)
                      )?.rotulo ?? ''
                    }`}
                    compositorId={filtroDeObras ?? compositores[0].id}
                    selecionados={obras.map((o) => o.id)}
                    aoEscolher={(o: ItemDoAcervo) => {
                      if (obras.some((x) => x.id === o.id)) return;
                      const lista = [
                        ...obras,
                        {
                          id: o.id,
                          rotulo: o.nome,
                          detalhe: o.compositor?.nome ?? o.detalhe,
                        },
                      ];
                      setObras(lista);
                      mudar(
                        'workIds',
                        lista.map((x) => x.id)
                      );
                    }}
                  />
                </div>
              ) : (
                <p className="t-legenda">
                  Escolha um compositor para ver as obras dele.
                </p>
              )}
            </Vinculos>
          </Grupo>

          <Grupo titulo="Música enquanto lê">
            <p className="t-legenda">
              Toca só quando o leitor aperta o botão: nunca começa sozinha.
            </p>
            <Field
              label="Endereço (YouTube ou arquivo)"
              value={valores.backgroundMusic?.url ?? ''}
              onChange={(e) =>
                mudar('backgroundMusic', {
                  ...valores.backgroundMusic,
                  url: e.target.value,
                })
              }
              placeholder="https://www.youtube.com/watch?v=…"
            />
            <label
              className={cx(
                classesDeBotao('secundario', 'p'),
                'cursor-pointer self-start'
              )}
            >
              <Icon de={PiUploadSimple} tamanho="pp" />
              {enviandoAudio ? 'Enviando…' : 'Enviar um arquivo de áudio'}
              <input
                type="file"
                accept="audio/mpeg,audio/mp3,audio/wav,audio/ogg"
                onChange={enviarAudio}
                className="sr-only"
                disabled={enviandoAudio}
              />
            </label>
            {valores.backgroundMusic?.url && (
              <>
                <Field
                  label="Nome da música"
                  value={valores.backgroundMusic?.title ?? ''}
                  onChange={(e) =>
                    mudar('backgroundMusic', {
                      ...valores.backgroundMusic,
                      title: e.target.value,
                    })
                  }
                />
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="volume-da-musica"
                    className="flex justify-between text-sm font-medium text-texto"
                  >
                    Volume inicial
                    <span className="t-dado t-legenda">
                      {Math.round(
                        (valores.backgroundMusic?.volume ?? 0.3) * 100
                      )}
                      %
                    </span>
                  </label>
                  <input
                    id="volume-da-musica"
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={valores.backgroundMusic?.volume ?? 0.3}
                    onChange={(e) =>
                      mudar('backgroundMusic', {
                        ...valores.backgroundMusic,
                        volume: Number(e.target.value),
                      })
                    }
                    className="blog-faixa w-full"
                    style={{
                      ['--cheio' as string]: `${(valores.backgroundMusic?.volume ?? 0.3) * 100}%`,
                    }}
                  />
                </div>
                <Interruptor
                  rotulo="Repetir"
                  ajuda="Volta ao começo quando termina."
                  ligado={valores.backgroundMusic?.loop ?? true}
                  aoMudar={(loop) =>
                    mudar('backgroundMusic', {
                      ...valores.backgroundMusic,
                      loop,
                    })
                  }
                />
                <Button
                  tamanho="p"
                  variante="fantasma"
                  icone={PiX}
                  onClick={() =>
                    mudar('backgroundMusic', { ...VAZIO.backgroundMusic })
                  }
                  className="self-start"
                >
                  Tirar a música
                </Button>
              </>
            )}
          </Grupo>

          <Grupo titulo="Leitura">
            <Field
              label="Tempo de leitura (min)"
              type="number"
              min={1}
              max={300}
              value={valores.readTime || ''}
              placeholder={String(minutosDeLeitura(valores.content))}
              onChange={(e) => mudar('readTime', Number(e.target.value) || 0)}
              ajuda={`Vazio: calculado do texto (${minutosDeLeitura(valores.content)} min, a 200 palavras por minuto).`}
            />
          </Grupo>
        </aside>
      </div>

      {recorte && (
        <CoverCropper
          imageUrl={recorte.src}
          onCropComplete={enviarCapa}
          onCancel={() => setRecorte(null)}
        />
      )}

      <Sheet
        aberto={previa}
        aoFechar={() => setPrevia(false)}
        titulo="Pré-visualização"
        largura="g"
      >
        <article className="flex flex-col gap-6">
          {valores.coverImage && (
            <Capa
              src={valores.coverImage}
              alt={valores.coverImageAlt ?? ''}
              inicial={valores.title}
              sizes="720px"
              className="aspect-[16/9] rounded-card"
            />
          )}
          <h1 className="font-display text-[2.5rem] leading-[1.05] text-balance">
            {valores.title || 'Sem título'}
          </h1>
          {valores.description && (
            <p className="text-[1.125rem] leading-[1.5] text-texto-suave">
              {valores.description}
            </p>
          )}
          <CorpoDoArtigo conteudo={valores.content} idioma="pt" />
        </article>
      </Sheet>

      <ConfirmModal
        isOpen={apagando}
        onClose={() => setApagando(false)}
        onConfirm={apagar}
        title="Apagar este artigo?"
        message="O artigo sai do blog, com os comentários, curtidas e versões. Não dá para desfazer."
        confirmText="Apagar"
        type="danger"
        acaoPerigosa
      />
    </form>
  );
}

// ---------------------------------------------------------------------------

/** Um grupo da lateral: superfície rebaixada, título de seção, recolhível. */
function Grupo({
  titulo,
  aberto = true,
  children,
}: {
  titulo: string;
  aberto?: boolean;
  children: ReactNode;
}) {
  return (
    <details
      open={aberto}
      className="group/grupo rounded-card bg-sup-2 px-5 [&[open]]:pb-5"
    >
      <summary className="flex min-h-[3.25rem] cursor-pointer list-none items-center justify-between t-secao [&::-webkit-details-marker]:hidden">
        {titulo}
        <Icon
          de={PiCaretDown}
          className="text-texto-fraco transition-transform duration-[var(--t-resposta)] group-open/grupo:rotate-180 motion-reduce:transition-none"
        />
      </summary>
      <div className="flex flex-col gap-4 pt-1">{children}</div>
    </details>
  );
}

/** Escolha de várias opções em fichas (categorias, tipos). */
function FichasDeEscolha({
  rotulo,
  opcoes,
  valores,
  aoMudar,
  ajuda,
}: {
  rotulo: string;
  opcoes: Array<{ valor: string; rotulo: string }>;
  valores: string[];
  aoMudar: (v: string[]) => void;
  ajuda?: string;
}) {
  return (
    <div role="group" aria-label={rotulo} className="flex flex-col gap-2">
      <span className="text-sm font-medium text-texto">{rotulo}</span>
      <div className="flex flex-wrap gap-2">
        {opcoes.map((o) => {
          const sel = valores.includes(o.valor);
          return (
            <Chip
              key={o.valor}
              selecionado={sel}
              onClick={() =>
                aoMudar(
                  sel
                    ? valores.filter((v) => v !== o.valor)
                    : [...valores, o.valor]
                )
              }
            >
              {o.rotulo}
            </Chip>
          );
        })}
      </div>
      {ajuda && <p className="t-legenda">{ajuda}</p>}
    </div>
  );
}

/** Compositores ou obras ligados ao artigo: a lista, e a busca embaixo. */
function Vinculos({
  rotulo,
  itens,
  aoTirar,
  children,
}: {
  rotulo: string;
  itens: Opcao[];
  aoTirar: (id: string) => void;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3">
      <span className="text-sm font-medium text-texto">{rotulo}</span>
      {itens.length > 0 && (
        <ul className="flex flex-col">
          {itens.map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between gap-2 border-b border-linha py-1.5 last:border-b-0"
            >
              <span className="flex min-w-0 flex-col">
                <span className="truncate text-[0.875rem] text-texto">
                  {item.rotulo}
                </span>
                {item.detalhe && (
                  <span className="t-legenda truncate">{item.detalhe}</span>
                )}
              </span>
              <Button
                tamanho="p"
                variante="fantasma"
                icone={PiX}
                rotulo={`Tirar ${item.rotulo}`}
                onClick={() => aoTirar(item.id)}
              />
            </li>
          ))}
        </ul>
      )}
      {children}
    </div>
  );
}
