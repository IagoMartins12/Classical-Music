'use client';

import { Selecao } from '@/app/components/ui/Selecao';
import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { PiArrowRight, PiLock } from 'react-icons/pi';
import ConfirmModal from '@/app/components/ConfirmModal';
import { Button } from '@/app/components/ui/Button';
import { Icon } from '@/app/components/ui/Icon';
import { Stack } from '@/app/components/ui/Layout';
import { Row } from '@/app/components/ui/Row';
import { Sheet } from '@/app/components/ui/Sheet';
import { Text } from '@/app/components/ui/Text';
import { cx } from '@/app/components/ui/cx';
import { Interruptor } from '@/app/components/Admin/painel/Campos';
import { Segmentos } from '@/app/components/Admin/painel/Controles';
import type {
  ModelField,
  ModelSchema,
} from '@/app/hooks/admin/useDatabaseStudio';
import {
  alterarDocumento,
  criarDocumento,
  getDatabaseRecord,
} from '@/app/requests/admin/database';

/**
 * Editor de documento do Database Studio — criar, alterar e duplicar, em qualquer
 * model, como no Atlas.
 *
 * **Dois jeitos de editar o mesmo rascunho**: campo a campo, com o controle
 * certo para cada tipo (liga/desliga, lista de enum, data, número, texto
 * longo, JSON), ou o documento inteiro em JSON. Os dois leem e escrevem o
 * mesmo rascunho.
 *
 * **Só o que mudou vai para a API**, e a tela mostra antes o campo, o valor
 * de antes e o de depois. Para gravar, digita-se a frase que a API exige
 * (`ATUALIZAR Model id`, `CRIAR Model`) — a mesma que fica na auditoria.
 *
 * O editor antigo abria com a linha da tabela (só as colunas visíveis),
 * mandava o documento inteiro de volta e pedia a palavra "CONFIRMAR", que a
 * API não aceita: salvar falhava sempre. Campo protegido (senha, token) não
 * aparece; id e datas mantidas pelo banco aparecem travados.
 */

type Modo = 'campos' | 'json';

const NUMERICOS = new Set(['Int', 'Float', 'Decimal', 'BigInt']);
const TEXTO_LONGO =
  /bio|content|description|descricao|html|text|notes|body|message|summary/i;

const editavel = (f: ModelField) =>
  !f.isSensitive && !f.isReadOnly && f.kind !== 'object';

const visivel = (f: ModelField) => !f.isSensitive && f.kind !== 'object';

const usaJson = (f: ModelField) => f.type === 'Json' || f.isList;

/** Valor → texto do campo. */
function paraTexto(f: ModelField, v: unknown): string {
  if (v === null || v === undefined) return '';
  if (usaJson(f)) return JSON.stringify(v, null, 2);
  if (f.type === 'DateTime') {
    const d = new Date(String(v));
    if (Number.isNaN(d.getTime())) return String(v);
    // datetime-local, no fuso de quem edita
    const off = d.getTimezoneOffset() * 60_000;
    return new Date(d.getTime() - off).toISOString().slice(0, 16);
  }
  return String(v);
}

/** Texto do campo → valor, ou erro. */
function doTexto(
  f: ModelField,
  t: string
): { valor: unknown } | { erro: string } {
  if (t.trim() === '') {
    if (f.isList) return { valor: [] };
    return f.isRequired ? { erro: 'Obrigatório.' } : { valor: null };
  }
  if (usaJson(f)) {
    try {
      const v = JSON.parse(t);
      if (f.isList && !Array.isArray(v)) {
        return { erro: 'Precisa ser uma lista: [ ... ].' };
      }
      return { valor: v };
    } catch {
      return { erro: 'JSON inválido.' };
    }
  }
  if (f.type === 'Boolean' && !f.isList) {
    return { valor: t === 'true' };
  }
  if (NUMERICOS.has(f.type)) {
    const n = Number(t.replace(',', '.'));
    if (!Number.isFinite(n)) return { erro: 'Número inválido.' };
    if (f.type === 'Int' && !Number.isInteger(n)) {
      return { erro: 'Precisa ser inteiro.' };
    }
    return { valor: n };
  }
  if (f.type === 'DateTime') {
    const d = new Date(t);
    return Number.isNaN(d.getTime())
      ? { erro: 'Data inválida.' }
      : { valor: d.toISOString() };
  }
  if (/Id$/.test(f.name) && f.type === 'String' && !/^[a-f0-9]{24}$/i.test(t)) {
    return { erro: 'Id do Mongo: 24 caracteres hexadecimais.' };
  }
  return { valor: t };
}

const igual = (a: unknown, b: unknown) =>
  JSON.stringify(a ?? null) === JSON.stringify(b ?? null);

const curto = (v: unknown) => {
  if (v === null || v === undefined || v === '') return 'vazio';
  const t = typeof v === 'string' ? v : JSON.stringify(v);
  return t.length > 120 ? `${t.slice(0, 120)}…` : t;
};

export function EditorDeDocumento({
  aberto,
  model,
  schema,
  id,
  duplicarDe,
  aoFechar,
  aoSalvar,
}: {
  aberto: boolean;
  model: string;
  schema: ModelSchema;
  /** Alterando: o id do documento. Nulo: criando. */
  id: string | null;
  /** Criando a partir de outro documento (duplicar): o id dele. */
  duplicarDe?: string | null;
  aoFechar: () => void;
  aoSalvar: () => void;
}) {
  const campos = useMemo(() => schema.fields.filter(visivel), [schema.fields]);
  const idField = schema.fields.find((f) => f.isId)?.name ?? 'id';

  const [original, setOriginal] = useState<Record<string, unknown> | null>(
    null
  );
  const [carregando, setCarregando] = useState(false);
  const [texto, setTexto] = useState<Record<string, string>>({});
  const [modo, setModo] = useState<Modo>('campos');
  const [json, setJson] = useState('');
  const [erroJson, setErroJson] = useState<string | null>(null);
  const [confirmando, setConfirmando] = useState(false);
  const [frase, setFrase] = useState('');
  const [salvando, setSalvando] = useState(false);

  // Carrega o documento inteiro (alterando) ou parte da base (duplicando).
  useEffect(() => {
    if (!aberto) return;
    let vivo = true;
    setModo('campos');
    setErroJson(null);
    const preencher = (doc: Record<string, unknown> | null) => {
      const t: Record<string, string> = {};
      for (const f of campos) t[f.name] = paraTexto(f, doc?.[f.name]);
      setTexto(t);
    };
    const fonte = id ?? duplicarDe ?? null;
    if (fonte) {
      setCarregando(true);
      getDatabaseRecord(model, idField, fonte)
        .then((doc) => {
          if (!vivo) return;
          // Duplicando, não há original: tudo o que vier preenchido é novo.
          setOriginal(id ? doc : null);
          preencher(doc);
        })
        .catch((e) =>
          toast.error(
            e instanceof Error ? e.message : 'Não foi possível ler o documento.'
          )
        )
        .finally(() => vivo && setCarregando(false));
    } else {
      setOriginal(null);
      preencher(null);
    }
    return () => {
      vivo = false;
    };
  }, [aberto, id, duplicarDe, model, idField, campos]);

  // O rascunho convertido, campo a campo, com os erros.
  const convertido = useMemo(() => {
    const valores: Record<string, unknown> = {};
    const erros: Record<string, string> = {};
    for (const f of campos.filter(editavel)) {
      const r = doTexto(f, texto[f.name] ?? '');
      if ('erro' in r) erros[f.name] = r.erro;
      else valores[f.name] = r.valor;
    }
    return { valores, erros };
  }, [campos, texto]);

  // O que muda: alterando, só o diferente do original; criando, o preenchido.
  const mudancas = useMemo(() => {
    const out: { campo: string; antes: unknown; depois: unknown }[] = [];
    for (const [campo, depois] of Object.entries(convertido.valores)) {
      if (id) {
        if (!igual(original?.[campo], depois)) {
          out.push({ campo, antes: original?.[campo], depois });
        }
      } else if (
        depois !== null &&
        !(Array.isArray(depois) && depois.length === 0)
      ) {
        out.push({ campo, antes: undefined, depois });
      }
    }
    return out;
  }, [convertido.valores, original, id]);

  const temErro = Object.keys(convertido.erros).length > 0;
  const fraseCerta = id ? `ATUALIZAR ${model} ${id}` : `CRIAR ${model}`;

  const trocarModo = (m: Modo) => {
    if (m === 'json') {
      const doc: Record<string, unknown> = {};
      for (const f of campos.filter(editavel)) {
        const r = doTexto(f, texto[f.name] ?? '');
        doc[f.name] = 'valor' in r ? r.valor : texto[f.name];
      }
      setJson(JSON.stringify(doc, null, 2));
      setErroJson(null);
    }
    setModo(m);
  };

  const aplicarJson = (t: string) => {
    setJson(t);
    try {
      const doc = JSON.parse(t) as Record<string, unknown>;
      if (!doc || typeof doc !== 'object' || Array.isArray(doc)) {
        setErroJson('O documento precisa ser um objeto: { ... }.');
        return;
      }
      const desconhecidos = Object.keys(doc).filter(
        (k) => !campos.some((f) => f.name === k && editavel(f))
      );
      if (desconhecidos.length) {
        setErroJson(
          `Campos que não existem ou não aceitam escrita: ${desconhecidos.join(', ')}.`
        );
        return;
      }
      setErroJson(null);
      setTexto((antes) => {
        const n = { ...antes };
        for (const f of campos.filter(editavel)) {
          if (f.name in doc) n[f.name] = paraTexto(f, doc[f.name]);
        }
        return n;
      });
    } catch {
      setErroJson('JSON inválido.');
    }
  };

  const salvar = async () => {
    setSalvando(true);
    try {
      const dados = Object.fromEntries(
        mudancas.map((m) => [m.campo, m.depois])
      );
      if (id) await alterarDocumento(model, id, dados, frase.trim());
      else await criarDocumento(model, dados, frase.trim());
      toast.success(id ? 'Documento alterado.' : 'Documento criado.');
      setConfirmando(false);
      setFrase('');
      aoSalvar();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Não foi possível salvar.');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <Sheet
      aberto={aberto}
      aoFechar={aoFechar}
      titulo={
        id
          ? `${model} · editar`
          : duplicarDe
            ? `${model} · duplicar`
            : `${model} · novo`
      }
      descricao={id ?? 'O banco gera o id e as datas.'}
      largura="g"
      rodape={
        <>
          <Button tamanho="p" variante="fantasma" onClick={aoFechar}>
            Cancelar
          </Button>
          <Button
            tamanho="p"
            variante="primario"
            disabled={
              carregando ||
              temErro ||
              (modo === 'json' && !!erroJson) ||
              mudancas.length === 0
            }
            onClick={() => setConfirmando(true)}
          >
            {id
              ? mudancas.length
                ? `Salvar ${mudancas.length} ${mudancas.length === 1 ? 'alteração' : 'alterações'}`
                : 'Nada mudou'
              : 'Criar'}
          </Button>
        </>
      }
    >
      {carregando ? (
        <Row.Skeleton repetir={6} />
      ) : (
        <Stack gap={4}>
          <Segmentos
            rotulo="Como editar"
            valor={modo}
            aoMudar={trocarModo}
            opcoes={[
              { valor: 'campos', rotulo: 'Campos' },
              { valor: 'json', rotulo: 'JSON' },
            ]}
          />

          {modo === 'json' ? (
            <Stack gap={2}>
              <label htmlFor="doc-json" className="t-legenda">
                O documento (só os campos que aceitam escrita)
              </label>
              <textarea
                id="doc-json"
                value={json}
                onChange={(e) => aplicarJson(e.target.value)}
                spellCheck={false}
                rows={22}
                className="input-classical t-dado w-full resize-y px-4 py-3 text-xs leading-relaxed"
              />
              {erroJson && (
                <Text papel="legenda" as="p" className="text-erro">
                  {erroJson}
                </Text>
              )}
            </Stack>
          ) : (
            <div className="flex flex-col divide-y divide-linha rounded-card bg-sup-2">
              {campos.map((f) => (
                <Campo
                  key={f.name}
                  f={f}
                  valor={texto[f.name] ?? ''}
                  original={original?.[f.name]}
                  erro={convertido.erros[f.name]}
                  mudou={mudancas.some((m) => m.campo === f.name)}
                  aoMudar={(v) => setTexto((t) => ({ ...t, [f.name]: v }))}
                />
              ))}
            </div>
          )}
        </Stack>
      )}

      <ConfirmModal
        isOpen={confirmando}
        onClose={() => {
          setConfirmando(false);
          setFrase('');
        }}
        onConfirm={salvar}
        type="warning"
        title={id ? 'Gravar as alterações?' : 'Criar o documento?'}
        message={
          id
            ? 'Escrita direta no banco: passa por cima das regras da plataforma. Fica na auditoria com o antes e o depois.'
            : 'Escrita direta no banco: passa por cima das regras da plataforma. Fica na auditoria.'
        }
        confirmText={id ? 'Gravar' : 'Criar'}
        isLoading={salvando}
        confirmarBloqueado={frase.trim() !== fraseCerta}
      >
        <Stack gap={3}>
          <ul className="flex max-h-60 flex-col divide-y divide-linha overflow-y-auto rounded-controle bg-sup-2 text-sm rolagem-discreta">
            {mudancas.map((m) => (
              <li key={m.campo} className="flex flex-col gap-0.5 px-3 py-2">
                <span className="t-dado text-xs text-texto-suave">
                  {m.campo}
                </span>
                <span className="flex flex-wrap items-center gap-1.5 break-all">
                  {id && (
                    <>
                      <span className="text-texto-fraco line-through">
                        {curto(m.antes)}
                      </span>
                      <Icon
                        de={PiArrowRight}
                        tamanho="pp"
                        className="text-texto-fraco"
                      />
                    </>
                  )}
                  <span className="text-texto">{curto(m.depois)}</span>
                </span>
              </li>
            ))}
          </ul>
          <label htmlFor="doc-frase" className="t-rotulo text-texto">
            Para confirmar, digite{' '}
            <span className="t-dado select-all">{fraseCerta}</span>
          </label>
          <input
            id="doc-frase"
            value={frase}
            onChange={(e) => setFrase(e.target.value)}
            autoComplete="off"
            spellCheck={false}
            className="input-classical t-dado w-full pl-4"
          />
        </Stack>
      </ConfirmModal>
    </Sheet>
  );
}

function Campo({
  f,
  valor,
  original,
  erro,
  mudou,
  aoMudar,
}: {
  f: ModelField;
  valor: string;
  original: unknown;
  erro?: string;
  mudou: boolean;
  aoMudar: (v: string) => void;
}) {
  const id = `campo-${f.name}`;
  const tipo = `${f.type}${f.isList ? '[]' : ''}${f.isRequired ? '' : '?'}`;

  if (!editavel(f)) {
    return (
      <div className="grid gap-1 px-4 py-3 sm:grid-cols-[180px_minmax(0,1fr)] sm:gap-4">
        <span className="flex flex-col">
          <span className="t-dado text-sm text-texto-suave">{f.name}</span>
          <span className="t-legenda inline-flex items-center gap-1">
            <Icon de={PiLock} tamanho="pp" /> mantido pelo banco
          </span>
        </span>
        <span className="t-dado break-all text-sm text-texto-fraco">
          {curto(original)}
        </span>
      </div>
    );
  }

  const cabeca = (
    <span className="flex flex-col">
      <label htmlFor={id} className="t-dado text-sm text-texto">
        {f.name}
      </label>
      <span className="t-legenda">
        {tipo}
        {mudou && <span className="text-ouro-texto"> · alterado</span>}
      </span>
    </span>
  );

  let controle: React.ReactNode;
  if (f.type === 'Boolean' && !f.isList) {
    controle = (
      <Interruptor
        rotulo={valor === 'true' ? 'Sim' : valor === 'false' ? 'Não' : 'Vazio'}
        ligado={valor === 'true'}
        aoMudar={(v) => aoMudar(v ? 'true' : 'false')}
      />
    );
  } else if (f.kind === 'enum' && !f.isList && f.enumValues?.length) {
    controle = (
      <Selecao
        id={id}
        opcoes={[
          ...(f.isRequired ? [] : [{ value: '', label: '(vazio)' }]),
          ...f.enumValues.map((v) => ({ value: v, label: v })),
        ]}
        valor={valor}
        aoMudar={aoMudar}
      />
    );
  } else if (usaJson(f) || TEXTO_LONGO.test(f.name) || valor.length > 80) {
    controle = (
      <textarea
        id={id}
        value={valor}
        onChange={(e) => aoMudar(e.target.value)}
        rows={
          usaJson(f) ? Math.min(12, Math.max(3, valor.split('\n').length)) : 4
        }
        spellCheck={!usaJson(f)}
        placeholder={f.isList ? '[ ]' : usaJson(f) ? '{ }' : undefined}
        className={cx(
          'input-classical w-full resize-y px-4 py-2.5',
          usaJson(f) && 't-dado text-xs'
        )}
      />
    );
  } else {
    controle = (
      <input
        id={id}
        type={
          f.type === 'DateTime'
            ? 'datetime-local'
            : NUMERICOS.has(f.type)
              ? 'number'
              : 'text'
        }
        step={f.type === 'Int' ? 1 : 'any'}
        value={valor}
        onChange={(e) => aoMudar(e.target.value)}
        className={cx(
          'input-classical w-full pl-4',
          (NUMERICOS.has(f.type) || /Id$/.test(f.name)) && 't-dado'
        )}
      />
    );
  }

  return (
    <div className="grid gap-2 px-4 py-3 sm:grid-cols-[180px_minmax(0,1fr)] sm:gap-4">
      {cabeca}
      <div className="flex min-w-0 flex-col gap-1">
        {controle}
        {erro && (
          <span className="t-legenda text-erro" role="alert">
            {erro}
          </span>
        )}
      </div>
    </div>
  );
}
