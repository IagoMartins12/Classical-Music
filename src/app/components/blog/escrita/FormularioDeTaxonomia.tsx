'use client';

import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import {
  PiArrowLeft,
  PiImage,
  PiTranslate,
  PiUploadSimple,
  PiX,
} from 'react-icons/pi';
import { Cabecalho, Secao } from '@/app/components/Admin/painel/Cabecalho';
import { Interruptor } from '@/app/components/Admin/painel/Campos';
import { Button, classesDeBotao } from '@/app/components/ui/Button';
import { Field } from '@/app/components/ui/Field';
import { Icon } from '@/app/components/ui/Icon';
import { cx } from '@/app/components/ui/cx';
import { Capa } from '@/app/components/blog/site/Capa';
import { VEU } from '@/app/components/blog/site/cartoes';
import {
  createCategory,
  createTag,
  removeCategoryImage,
  translateTexts,
  updateCategory,
  updateTag,
  uploadCategoryImage,
} from '@/app/requests/blog/admin-actions';
import { LIMITES } from '@/app/utils/blog/seo';
import { paraSlug } from './TelaDeEscrita';

/**
 * Criar e editar categoria e tag do blog, na casca do painel.
 *
 * **Sem cor e sem emoji** (decisão de 30/09). A categoria ganha o que o
 * formulário antigo não mostrava e a API já aceitava: aparecer ou não no
 * menu, e o título e a descrição para a busca — a página da categoria é
 * indexada. A imagem é a capa da página da categoria; a prévia mostra como
 * ela fica, com o nome por cima.
 */

export interface CategoriaEmEdicao {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  isActive: boolean;
  showInMenu?: boolean;
  metaTitle?: string | null;
  metaDescription?: string | null;
  inMoreMenu?: boolean;
  showOnHome?: boolean;
  translation?: Record<string, string> | null;
}

export function FormularioDeCategoria({
  categoria,
}: {
  categoria?: CategoriaEmEdicao;
}) {
  const router = useRouter();
  const editando = !!categoria;
  const entrada = useRef<HTMLInputElement>(null);

  const [nome, setNome] = useState(categoria?.name ?? '');
  const [slug, setSlug] = useState(categoria?.slug ?? '');
  const [slugManual, setSlugManual] = useState(editando);
  const [descricao, setDescricao] = useState(categoria?.description ?? '');
  const [ativa, setAtiva] = useState(categoria?.isActive ?? true);
  const [noMenu, setNoMenu] = useState(categoria?.showInMenu ?? true);
  const [metaTitulo, setMetaTitulo] = useState(categoria?.metaTitle ?? '');
  const [metaDescricao, setMetaDescricao] = useState(
    categoria?.metaDescription ?? ''
  );
  const [noChevron, setNoChevron] = useState(categoria?.inMoreMenu ?? false);
  const [noInicio, setNoInicio] = useState(categoria?.showOnHome ?? false);
  const [ingles, setIngles] = useState({
    name: categoria?.translation?.name ?? '',
    description: categoria?.translation?.description ?? '',
    metaTitle: categoria?.translation?.metaTitle ?? '',
    metaDescription: categoria?.translation?.metaDescription ?? '',
  });
  const [imagem, setImagem] = useState<string | null>(categoria?.image ?? null);
  const [pendente, setPendente] = useState<File | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erros, setErros] = useState<Record<string, string>>({});

  useEffect(
    () => () => {
      if (pendente && imagem?.startsWith('blob:')) URL.revokeObjectURL(imagem);
    },
    [pendente, imagem]
  );

  async function escolher(e: ChangeEvent<HTMLInputElement>) {
    const arquivo = e.target.files?.[0];
    e.target.value = '';
    if (!arquivo) return;
    if (!arquivo.type.startsWith('image/'))
      return toast.error('Escolha uma imagem.');
    if (arquivo.size > 2 * 1024 * 1024)
      return toast.error('A imagem passa de 2 MB.');
    // A imagem sobe pela rota da categoria, que precisa do id: na criação ela
    // espera a categoria existir.
    if (!categoria) {
      setPendente(arquivo);
      setImagem(URL.createObjectURL(arquivo));
      return;
    }
    setEnviando(true);
    try {
      setImagem(await uploadCategoryImage(categoria.id, arquivo));
    } catch (falha) {
      toast.error(
        falha instanceof Error
          ? falha.message
          : 'Não foi possível enviar a imagem.'
      );
    } finally {
      setEnviando(false);
    }
  }

  async function tirar() {
    if (pendente || !categoria) {
      setPendente(null);
      setImagem(null);
      return;
    }
    try {
      await removeCategoryImage(categoria.id);
      setImagem(null);
    } catch (falha) {
      toast.error(
        falha instanceof Error
          ? falha.message
          : 'Não foi possível tirar a imagem.'
      );
    }
  }

  async function salvar(e: FormEvent) {
    e.preventDefault();
    const novos: Record<string, string> = {};
    if (nome.trim().length < 2) novos.nome = 'Escreva o nome da categoria.';
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug))
      novos.slug = 'Use letras minúsculas, números e hífens.';
    setErros(novos);
    if (Object.keys(novos).length) return;

    setSalvando(true);
    const corpo = {
      name: nome,
      slug,
      description: descricao,
      isActive: ativa,
      showInMenu: noMenu,
      inMoreMenu: noChevron,
      showOnHome: noInicio,
      metaTitle: metaTitulo,
      metaDescription: metaDescricao,
      translation: ingles,
    };
    try {
      if (categoria) {
        await updateCategory(categoria.id, corpo);
      } else {
        const { id } = await createCategory(corpo);
        if (pendente && id) {
          await uploadCategoryImage(id, pendente).catch(() =>
            toast.error(
              'A categoria foi criada, mas a imagem não subiu. Envie de novo na edição.'
            )
          );
        }
      }
      toast.success(editando ? 'Categoria salva.' : 'Categoria criada.');
      router.push('/blog/admin/categories');
      router.refresh();
    } catch (falha) {
      toast.error(
        falha instanceof Error ? falha.message : 'Não foi possível salvar.'
      );
    } finally {
      setSalvando(false);
    }
  }

  return (
    <form
      onSubmit={salvar}
      className="flex max-w-[var(--largura-texto)] flex-col gap-8"
    >
      <Voltar href="/blog/admin/categories" rotulo="Categorias e tags" />
      <Cabecalho
        titulo={editando ? `Editar ${categoria.name}` : 'Nova categoria'}
        descricao="Cada categoria é uma página do blog, com a capa e a lista dos artigos dela."
        aoAtualizar={false}
        acoes={
          <Button
            type="submit"
            variante="primario"
            tamanho="p"
            carregando={salvando}
          >
            {editando ? 'Salvar' : 'Criar a categoria'}
          </Button>
        }
      />

      <Secao titulo="A categoria" id="categoria-dados">
        <div className="flex flex-col gap-4">
          <Field
            label="Nome"
            value={nome}
            maxLength={50}
            onChange={(e) => {
              setNome(e.target.value);
              if (!slugManual) setSlug(paraSlug(e.target.value));
            }}
            erro={erros.nome}
          />
          <Field
            label="Endereço"
            value={slug}
            onChange={(e) => {
              setSlugManual(true);
              setSlug(
                paraSlug(e.target.value) +
                  (e.target.value.endsWith('-') ? '-' : '')
              );
            }}
            erro={erros.slug}
            ajuda={`/blog/category/${slug || '...'}${editando ? ' · mudar o endereço quebra os links que já apontam para ele.' : ''}`}
          />
          <Field.Area
            label="Descrição"
            rows={3}
            maxLength={300}
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            ajuda={`Aparece no topo da página da categoria e, sem descrição de SEO, no Google. ${descricao.length} caracteres.`}
          />
          <Interruptor
            rotulo="Ativa"
            ajuda={
              ativa
                ? 'A categoria aparece no blog.'
                : 'Desativada: some do blog, das listas e dos filtros.'
            }
            ligado={ativa}
            aoMudar={setAtiva}
          />
          <Interruptor
            rotulo="Aparece no menu do blog"
            ajuda="A faixa de categorias do cabeçalho, no telefone."
            ligado={noMenu}
            aoMudar={setNoMenu}
          />
          <Interruptor
            rotulo="Atalho no menu Categorias"
            ajuda="Aparece na lista do chevron ao lado de Categorias, no computador, e como sublista no menu do telefone."
            ligado={noChevron}
            aoMudar={setNoChevron}
          />
          <Interruptor
            rotulo="Seção no início do blog"
            ajuda="Ganha uma seção própria no início, com os últimos artigos. As seções seguem a ordem das categorias."
            ligado={noInicio}
            aoMudar={setNoInicio}
          />
        </div>
      </Secao>

      <Secao titulo="Capa" id="categoria-capa">
        <div className="flex flex-col gap-3">
          <div className="relative isolate flex min-h-48 items-end overflow-hidden rounded-card">
            <Capa
              src={imagem}
              alt=""
              inicial={nome || 'C'}
              sizes="720px"
              preencher
            />
            <span aria-hidden="true" className={VEU} />
            <p className="relative p-5 font-display text-[1.875rem] leading-tight text-sobre-foto">
              {nome || 'Nome da categoria'}
            </p>
          </div>
          <p className="t-legenda">
            Sem imagem, a página usa a capa do artigo mais recente da categoria.
          </p>
          <div className="flex gap-2">
            <label
              className={cx(
                classesDeBotao('secundario', 'p'),
                'cursor-pointer'
              )}
            >
              <Icon de={imagem ? PiUploadSimple : PiImage} tamanho="pp" />
              {enviando
                ? 'Enviando…'
                : imagem
                  ? 'Trocar a imagem'
                  : 'Escolher a imagem'}
              <input
                ref={entrada}
                type="file"
                accept="image/*"
                onChange={escolher}
                className="sr-only"
                disabled={enviando}
              />
            </label>
            {imagem && (
              <Button
                tamanho="p"
                variante="fantasma"
                icone={PiX}
                onClick={tirar}
              >
                Tirar
              </Button>
            )}
          </div>
        </div>
      </Secao>

      <Secao titulo="Em inglês" id="categoria-ingles">
        <EmIngles
          campos={[
            { chave: 'name', rotulo: 'Nome', original: nome },
            {
              chave: 'description',
              rotulo: 'Descrição',
              original: descricao,
              longo: true,
            },
            {
              chave: 'metaTitle',
              rotulo: 'Título para a busca',
              original: metaTitulo,
            },
            {
              chave: 'metaDescription',
              rotulo: 'Descrição para a busca',
              original: metaDescricao,
              longo: true,
            },
          ]}
          valores={ingles}
          aoMudar={(v) => setIngles((atual) => ({ ...atual, ...v }))}
        />
      </Secao>

      <Secao titulo="Busca" id="categoria-seo">
        <div className="flex flex-col gap-4">
          <Field
            label="Título para a busca"
            value={metaTitulo}
            onChange={(e) => setMetaTitulo(e.target.value)}
            placeholder={nome}
            ajuda={`Opcional. Sem ele, vale o nome. ${(metaTitulo || nome).length} de ${LIMITES.titulo.max}.`}
          />
          <Field.Area
            label="Descrição para a busca"
            rows={3}
            value={metaDescricao}
            onChange={(e) => setMetaDescricao(e.target.value)}
            placeholder={descricao}
            ajuda={`Opcional. Sem ela, vale a descrição. ${metaDescricao.length} de ${LIMITES.descricao.max}.`}
          />
        </div>
      </Secao>
    </form>
  );
}

export interface TagEmEdicao {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  translation?: Record<string, string> | null;
}

export function FormularioDeTag({ tag }: { tag?: TagEmEdicao }) {
  const router = useRouter();
  const editando = !!tag;
  const [nome, setNome] = useState(tag?.name ?? '');
  const [slug, setSlug] = useState(tag?.slug ?? '');
  const [slugManual, setSlugManual] = useState(editando);
  const [descricao, setDescricao] = useState(tag?.description ?? '');
  const [ingles, setIngles] = useState({
    name: tag?.translation?.name ?? '',
    description: tag?.translation?.description ?? '',
  });
  const [salvando, setSalvando] = useState(false);
  const [erros, setErros] = useState<Record<string, string>>({});

  async function salvar(e: FormEvent) {
    e.preventDefault();
    const novos: Record<string, string> = {};
    if (nome.trim().length < 2) novos.nome = 'Escreva o nome da tag.';
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug))
      novos.slug = 'Use letras minúsculas, números e hífens.';
    setErros(novos);
    if (Object.keys(novos).length) return;
    setSalvando(true);
    try {
      const corpo = {
        name: nome,
        slug,
        description: descricao,
        translation: ingles,
      };
      if (tag) await updateTag(tag.id, corpo);
      else await createTag(corpo);
      toast.success(editando ? 'Tag salva.' : 'Tag criada.');
      router.push('/blog/admin/tags');
      router.refresh();
    } catch (falha) {
      toast.error(
        falha instanceof Error ? falha.message : 'Não foi possível salvar.'
      );
    } finally {
      setSalvando(false);
    }
  }

  return (
    <form
      onSubmit={salvar}
      className="flex max-w-[var(--largura-texto)] flex-col gap-8"
    >
      <Voltar href="/blog/admin/tags" rotulo="Categorias e tags" />
      <Cabecalho
        titulo={editando ? `Editar ${tag.name}` : 'Nova tag'}
        descricao="Cada tag com mais de um artigo vira uma página de assunto no blog."
        aoAtualizar={false}
        acoes={
          <Button
            type="submit"
            variante="primario"
            tamanho="p"
            carregando={salvando}
          >
            {editando ? 'Salvar' : 'Criar a tag'}
          </Button>
        }
      />
      <div className="flex flex-col gap-4">
        <Field
          label="Nome"
          value={nome}
          maxLength={50}
          onChange={(e) => {
            setNome(e.target.value);
            if (!slugManual) setSlug(paraSlug(e.target.value));
          }}
          erro={erros.nome}
        />
        <Field
          label="Endereço"
          value={slug}
          onChange={(e) => {
            setSlugManual(true);
            setSlug(
              paraSlug(e.target.value) +
                (e.target.value.endsWith('-') ? '-' : '')
            );
          }}
          erro={erros.slug}
          ajuda={`/blog/tag/${slug || '...'}`}
        />
        <Field.Area
          label="Descrição"
          rows={3}
          maxLength={300}
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          ajuda="Aparece no topo da página do assunto e no Google."
        />
      </div>
      <section aria-labelledby="tag-ingles" className="flex flex-col gap-4">
        <h2 id="tag-ingles" className="t-subtitulo">
          Em inglês
        </h2>
        <EmIngles
          campos={[
            { chave: 'name', rotulo: 'Nome', original: nome },
            {
              chave: 'description',
              rotulo: 'Descrição',
              original: descricao,
              longo: true,
            },
          ]}
          valores={ingles}
          aoMudar={(v) => setIngles((atual) => ({ ...atual, ...v }))}
        />
      </section>
    </form>
  );
}

function Voltar({ href, rotulo }: { href: string; rotulo: string }) {
  return (
    <Link
      href={href}
      className="t-rotulo -mb-4 inline-flex min-h-[var(--alvo)] items-center gap-2 self-start text-texto-fraco hover:text-texto"
    >
      <Icon de={PiArrowLeft} tamanho="pp" />
      {rotulo}
    </Link>
  );
}

/**
 * Os campos em inglês de uma categoria ou tag, com o botão que preenche pela
 * tradução automática (o mesmo serviço do artigo). Vazio, o blog em inglês
 * mostra o português.
 */
function EmIngles<K extends string>({
  campos,
  valores,
  aoMudar,
}: {
  campos: Array<{
    chave: K;
    rotulo: string;
    original: string;
    longo?: boolean;
  }>;
  valores: Record<K, string>;
  aoMudar: (v: Partial<Record<K, string>>) => void;
}) {
  const [traduzindo, setTraduzindo] = useState(false);
  const comTexto = campos.filter((c) => c.original.trim());

  async function traduzir() {
    setTraduzindo(true);
    try {
      const saida = await translateTexts(
        comTexto.map((c) => c.original),
        'pt',
        'en'
      );
      aoMudar(
        Object.fromEntries(
          comTexto.map((c, i) => [c.chave, saida[i]])
        ) as Partial<Record<K, string>>
      );
      toast.success('Tradução pronta. Revise antes de salvar.');
    } catch (falha) {
      toast.error(
        falha instanceof Error ? falha.message : 'Não deu para traduzir agora.'
      );
    } finally {
      setTraduzindo(false);
    }
  }

  return (
    <div className="flex flex-col gap-4" lang="en">
      <Button
        tamanho="p"
        icone={PiTranslate}
        carregando={traduzindo}
        disabled={!comTexto.length}
        onClick={traduzir}
        className="self-start"
      >
        Traduzir do português
      </Button>
      {campos.map((c) =>
        c.longo ? (
          <Field.Area
            key={c.chave}
            label={c.rotulo}
            rows={3}
            value={valores[c.chave]}
            placeholder={c.original}
            onChange={(e) =>
              aoMudar({ [c.chave]: e.target.value } as Partial<
                Record<K, string>
              >)
            }
          />
        ) : (
          <Field
            key={c.chave}
            label={c.rotulo}
            value={valores[c.chave]}
            placeholder={c.original}
            onChange={(e) =>
              aoMudar({ [c.chave]: e.target.value } as Partial<
                Record<K, string>
              >)
            }
          />
        )
      )}
    </div>
  );
}
