'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { PiCopy, PiMusicNotes, PiVideoCamera } from 'react-icons/pi';
import ConfirmModal from '@/app/components/ConfirmModal';
import { Badge, Chip } from '@/app/components/ui/Badge';
import { Button } from '@/app/components/ui/Button';
import { Vazio } from '@/app/components/ui/Estados';
import { Icon } from '@/app/components/ui/Icon';
import { Stack } from '@/app/components/ui/Layout';
import { Sheet } from '@/app/components/ui/Sheet';
import { Skeleton } from '@/app/components/ui/Skeleton';
import { Text } from '@/app/components/ui/Text';
import { cx } from '@/app/components/ui/cx';
import { Cabecalho } from '@/app/components/Admin/painel/Cabecalho';
import { BarraDeSelecao } from '@/app/components/Admin/painel/Controles';
import { Numeros } from '@/app/components/Admin/painel/Numeros';
import { bytes, data, numero } from '@/app/components/Admin/painel/formatos';
import {
  adminKeys,
  useAdminQuery,
  useInvalidateAdmin,
} from '@/app/hooks/admin/query';
import {
  fetchGallery,
  type BlogMediaFile,
  type MediaCategory,
} from '@/app/hooks/admin/useBlogMediaGallery';
import { apiFetch } from '@/app/libs/api/client';

/**
 * Mídia do blog: as imagens e áudios que os artigos usam — e os que ficaram
 * soltos.
 *
 * O caso de uso é limpar: um arquivo sem uso ocupa armazenamento pago. A
 * grade mostra o arquivo (é o jeito de reconhecer uma imagem), quantos
 * artigos o usam, e só deixa marcar o que a API aceita apagar — registrado
 * por ela e fora de uso. A tela antiga perguntava com `window.confirm`.
 */

const CATEGORIAS: { valor: MediaCategory; rotulo: string }[] = [
  { valor: 'all', rotulo: 'Tudo' },
  { valor: 'cover', rotulo: 'Capas' },
  { valor: 'content', rotulo: 'Conteúdo' },
  { valor: 'gallery', rotulo: 'Galeria' },
  { valor: 'audio', rotulo: 'Áudios' },
  { valor: 'temp', rotulo: 'Temporários' },
];

const USO: Record<string, string> = {
  cover: 'capa',
  content: 'no texto',
  'background-music': 'música de fundo',
  gallery: 'galeria',
};

export default function MidiaDoBlog() {
  const [categoria, setCategoria] = useState<MediaCategory>('all');
  const [soSemUso, setSoSemUso] = useState(false);
  const [marcados, setMarcados] = useState<string[]>([]);
  const [aberto, setAberto] = useState<BlogMediaFile | null>(null);
  const [apagando, setApagando] = useState(false);
  const [trabalhando, setTrabalhando] = useState(false);
  const invalidar = useInvalidateAdmin();

  const opcoes = {
    category: categoria === 'all' ? undefined : categoria,
    includeTemp: true,
  };
  const galeria = useAdminQuery(adminKeys.list('blog-media', opcoes), () =>
    fetchGallery(opcoes)
  );
  const g = galeria.data;

  const arquivos = useMemo(
    () => (g?.files ?? []).filter((f) => !soSemUso || !f.isUsed),
    [g, soSemUso]
  );
  const apagavel = (f: BlogMediaFile) => !f.isUsed && f.deletable !== false;
  const tamanhoMarcado = (g?.files ?? [])
    .filter((f) => marcados.includes(f.url))
    .reduce((s, f) => s + f.size, 0);

  const apagar = async () => {
    setTrabalhando(true);
    try {
      await apiFetch('/blog/admin/media', {
        method: 'DELETE',
        body: { fileUrls: marcados },
      });
      toast.success(
        `${marcados.length} ${marcados.length === 1 ? 'arquivo apagado' : 'arquivos apagados'}.`
      );
      setMarcados([]);
      await invalidar('blog-media');
      void invalidar('auditoria');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Não foi possível apagar.');
    } finally {
      setTrabalhando(false);
      setApagando(false);
    }
  };

  const s = g?.stats;

  return (
    <Stack gap={6}>
      <Cabecalho
        titulo="Mídia do blog"
        descricao="Imagens e áudios dos artigos — e o que ficou solto"
      />

      <Numeros
        carregando={galeria.loading}
        itens={[
          {
            id: 'total',
            rotulo: 'Arquivos',
            aoClicar: () => {
              setCategoria('all');
              setSoSemUso(false);
            },
            valor: numero(s?.totalFiles),
            nota: s ? s.formattedTotalSize : undefined,
          },
          {
            id: 'uso',
            rotulo: 'Em uso',
            aoClicar: () => {
              setCategoria('all');
              setSoSemUso(false);
            },
            valor: numero(s?.usedFiles),
            nota: s
              ? `${numero(s.multiUseFiles)} em mais de um artigo`
              : undefined,
          },
          {
            id: 'sem-uso',
            rotulo: 'Sem uso',
            aoClicar: () => setSoSemUso(true),
            valor: numero(s?.unusedFiles),
            tom: s?.unusedFiles ? 'atencao' : undefined,
          },
          {
            id: 'temp',
            rotulo: 'Temporários',
            aoClicar: () => setCategoria('temp'),
            valor: numero(s?.temporaryFiles),
            nota: s ? bytes(s.temporarySize) : undefined,
          },
        ]}
      />

      <div className="flex flex-wrap items-center gap-2">
        {CATEGORIAS.map((c) => (
          <Chip
            key={c.valor}
            selecionado={categoria === c.valor}
            onClick={() => {
              setCategoria(c.valor);
              setMarcados([]);
            }}
          >
            {c.rotulo}
          </Chip>
        ))}
        <span className="mx-1 h-5 w-px bg-linha" aria-hidden="true" />
        <Chip selecionado={soSemUso} onClick={() => setSoSemUso((v) => !v)}>
          Só os sem uso
        </Chip>
        {arquivos.some(apagavel) && (
          <Button
            variante="texto"
            tamanho="p"
            onClick={() =>
              setMarcados(arquivos.filter(apagavel).map((f) => f.url))
            }
            className="ml-auto"
          >
            Marcar todos os apagáveis
          </Button>
        )}
      </div>

      <BarraDeSelecao
        quantidade={marcados.length}
        singular="arquivo marcado"
        plural="arquivos marcados"
        aoLimpar={() => setMarcados([])}
      >
        <Button tamanho="p" variante="perigo" onClick={() => setApagando(true)}>
          Apagar ({bytes(tamanhoMarcado)})
        </Button>
      </BarraDeSelecao>

      {galeria.loading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {Array.from({ length: 10 }, (_, i) => (
            <Skeleton key={i} forma="bloco" className="aspect-[4/3] w-full" />
          ))}
        </div>
      ) : galeria.error ? (
        <Text papel="rotulo" tom="erro" as="p">
          {galeria.error}
        </Text>
      ) : arquivos.length === 0 ? (
        <Vazio
          titulo={
            soSemUso
              ? 'Nenhum arquivo solto'
              : categoria === 'all'
                ? 'Nenhum arquivo enviado'
                : 'Nenhum arquivo nesta categoria'
          }
          descricao={
            soSemUso
              ? 'Tudo o que está aqui é usado por algum artigo.'
              : categoria === 'all'
                ? 'Capas, imagens e áudios aparecem aqui quando são enviados num artigo.'
                : undefined
          }
        />
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {arquivos.map((f) => {
            const marcado = marcados.includes(f.url);
            return (
              <li
                key={f.url}
                className={cx(
                  'group relative flex flex-col overflow-hidden rounded-card bg-sup-2',
                  marcado && 'ring-2 ring-ouro'
                )}
              >
                <button
                  type="button"
                  onClick={() => setAberto(f)}
                  className="block aspect-[4/3] w-full overflow-hidden bg-[var(--linha)]"
                >
                  {f.type === 'IMAGE' ? (
                    // eslint-disable-next-line @next/next/no-img-element -- miniatura de arquivo de qualquer origem
                    <img
                      src={f.url}
                      alt={f.alt ?? ''}
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="grid h-full place-items-center text-texto-fraco">
                      <Icon
                        de={f.type === 'AUDIO' ? PiMusicNotes : PiVideoCamera}
                        tamanho="g"
                      />
                    </span>
                  )}
                </button>
                <div className="flex items-center gap-2 px-3 py-2">
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span
                      className={cx(
                        't-legenda truncate',
                        f.isUsed ? 'text-texto-suave' : 'text-atencao'
                      )}
                    >
                      {f.isUsed
                        ? `em ${f.usageCount} ${f.usageCount === 1 ? 'artigo' : 'artigos'}`
                        : 'sem uso'}
                    </span>
                    <span className="t-legenda t-dado">{f.formattedSize}</span>
                  </span>
                  {apagavel(f) && (
                    <input
                      type="checkbox"
                      checked={marcado}
                      onChange={() =>
                        setMarcados((m) =>
                          m.includes(f.url)
                            ? m.filter((x) => x !== f.url)
                            : [...m, f.url]
                        )
                      }
                      aria-label="Marcar para apagar"
                      className="h-4 w-4 accent-[var(--ouro)]"
                    />
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <Sheet
        aberto={!!aberto}
        aoFechar={() => setAberto(null)}
        titulo="Arquivo"
        descricao={
          aberto
            ? `${aberto.formattedSize}${aberto.width ? ` · ${aberto.width}×${aberto.height}` : ''} · enviado ${data(aberto.createdAt)}`
            : undefined
        }
        largura="g"
      >
        {aberto && (
          <Stack gap={4}>
            {aberto.type === 'IMAGE' ? (
              // eslint-disable-next-line @next/next/no-img-element -- prévia do arquivo
              <img
                src={aberto.url}
                alt={aberto.alt ?? ''}
                className="max-h-96 w-full rounded-controle object-contain bg-sup-2"
              />
            ) : aberto.type === 'AUDIO' ? (
              <audio controls src={aberto.url} className="w-full" />
            ) : (
              <video
                controls
                src={aberto.url}
                className="w-full rounded-controle"
              />
            )}
            <div className="flex items-center gap-2">
              <code className="t-dado min-w-0 flex-1 truncate rounded-controle bg-sup-2 px-3 py-2 text-xs">
                {aberto.url}
              </code>
              <Button
                tamanho="p"
                icone={PiCopy}
                rotulo="Copiar endereço"
                onClick={() => {
                  void navigator.clipboard.writeText(aberto.url);
                  toast.success('Endereço copiado.');
                }}
              />
            </div>
            <Stack gap={2}>
              <Text papel="secao" as="h3">
                Onde é usado
              </Text>
              {aberto.usedIn.length === 0 ? (
                <Text papel="rotulo" tom="suave" as="p">
                  Em nenhum artigo.{' '}
                  {aberto.deletable === false
                    ? 'Não foi enviado pela API, então não pode ser apagado daqui.'
                    : 'Pode ser apagado.'}
                </Text>
              ) : (
                <ul className="flex flex-col">
                  {aberto.usedIn.map((u) => (
                    <li
                      key={`${u.articleId}-${u.usageType}`}
                      className="flex items-baseline gap-3 border-b border-linha py-2 last:border-0"
                    >
                      <Link
                        href={`/blog/${u.slug}`}
                        target="_blank"
                        className="min-w-0 flex-1 truncate font-display text-[1.0625rem] text-texto hover:text-ouro-texto"
                      >
                        {u.articleTitle}
                      </Link>
                      <Badge>{USO[u.usageType] ?? u.usageType}</Badge>
                    </li>
                  ))}
                </ul>
              )}
            </Stack>
          </Stack>
        )}
      </Sheet>

      <ConfirmModal
        isOpen={apagando}
        onClose={() => setApagando(false)}
        onConfirm={apagar}
        type="danger"
        acaoPerigosa
        title={`Apagar ${marcados.length} ${marcados.length === 1 ? 'arquivo' : 'arquivos'}?`}
        message={`Libera ${bytes(tamanhoMarcado)} do armazenamento. Nenhum artigo usa estes arquivos.`}
        confirmText="Apagar"
        cancelText="Voltar"
        isLoading={trabalhando}
      />
    </Stack>
  );
}
