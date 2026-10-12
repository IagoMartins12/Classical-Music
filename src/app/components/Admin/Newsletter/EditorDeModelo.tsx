'use client';

import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { PiEye } from 'react-icons/pi';
import { Button } from '@/app/components/ui/Button';
import { Field } from '@/app/components/ui/Field';
import { Stack } from '@/app/components/ui/Layout';
import { Sheet } from '@/app/components/ui/Sheet';
import { Text } from '@/app/components/ui/Text';
import { Interruptor } from '@/app/components/Admin/painel/Campos';
import { Segmentos } from '@/app/components/Admin/painel/Controles';
import { useNewsletterAdmin } from '@/app/hooks/admin/useNewsletterAdmin';
import {
  extractVariables,
  MODELOS_PRONTOS,
} from '@/app/libs/newsletter/modelosProntos';
import { CONTATO } from '@/app/utils/contato';
import { PreviaDeEmail } from './PreviaDeEmail';

/**
 * Criar e editar modelo de e-mail da newsletter.
 *
 * Era um modal de 642 linhas com três "passos" que eram só abas, uma prévia
 * própria (outro modal, com o HTML injetado na página) e os campos antigos.
 * Aqui são as mesmas três partes em abas, a prévia é a do painel
 * (`PreviaDeEmail`, com o HTML isolado) e as variáveis aparecem enquanto se
 * escreve.
 */

const TIPOS = [
  { value: 'CAMPAIGN_CUSTOM', label: 'Campanha' },
  { value: 'WELCOME', label: 'Boas-vindas' },
  { value: 'ACCOUNT_CONFIRMATION', label: 'Confirmação de conta' },
  { value: 'PASSWORD_RESET', label: 'Troca de senha' },
  { value: 'WEEKLY_DIGEST', label: 'Resumo semanal' },
  { value: 'NEW_COMPOSER', label: 'Novo compositor' },
];

type Aba = 'basico' | 'conteudo' | 'envio';

interface Modelo {
  name: string;
  type: string;
  subject: string;
  htmlContent: string;
  textContent: string;
  description: string;
  senderName: string;
  senderEmail: string;
  replyToEmail: string;
  isActive: boolean;
  isDefault: boolean;
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function inicial(t: Record<string, unknown> | null): Modelo {
  const s = (k: string, padrao = '') =>
    typeof t?.[k] === 'string' ? (t[k] as string) : padrao;
  return {
    name: s('name'),
    type: s('type', 'CAMPAIGN_CUSTOM'),
    subject: s('subject'),
    htmlContent: s('htmlContent'),
    textContent: s('textContent'),
    description: s('description'),
    senderName: s('senderName', 'Opus Atlas'),
    senderEmail: s('senderEmail', CONTATO.semResposta),
    replyToEmail: s('replyToEmail'),
    isActive: (t?.isActive as boolean | undefined) ?? true,
    isDefault: (t?.isDefault as boolean | undefined) ?? false,
  };
}

export function EditorDeModelo({
  modelo,
  aoFechar,
  aoSalvar,
}: {
  /** Nulo: modelo novo. */
  modelo: (Record<string, unknown> & { id?: string }) | null;
  aoFechar: () => void;
  aoSalvar: () => void;
}) {
  const { createTemplate, updateTemplate } = useNewsletterAdmin();
  const [m, setM] = useState<Modelo>(() => inicial(modelo));
  const [aba, setAba] = useState<Aba>('basico');
  const [tentou, setTentou] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [vendo, setVendo] = useState(false);

  const variaveis = useMemo(
    () => extractVariables(`${m.subject} ${m.htmlContent} ${m.textContent}`),
    [m.subject, m.htmlContent, m.textContent]
  );

  const erros = useMemo(() => {
    const e: Partial<Record<keyof Modelo, string>> = {};
    if (m.name.trim().length < 2) e.name = 'Dê um nome ao modelo.';
    if (!m.subject.trim()) e.subject = 'O e-mail precisa de assunto.';
    if (!m.htmlContent.trim()) e.htmlContent = 'Falta o conteúdo em HTML.';
    if (!EMAIL.test(m.senderEmail.trim())) e.senderEmail = 'E-mail inválido.';
    if (m.replyToEmail && !EMAIL.test(m.replyToEmail.trim())) {
      e.replyToEmail = 'E-mail inválido.';
    }
    return e;
  }, [m]);

  const mostrar = (k: keyof Modelo) => (tentou ? erros[k] : undefined);
  const muda =
    <K extends keyof Modelo>(k: K) =>
    (v: Modelo[K]) =>
      setM((x) => ({ ...x, [k]: v }));

  const partirDe = (tipo: string) => {
    const p = MODELOS_PRONTOS.find((t) => t.type === tipo);
    if (!p) return;
    setM((x) => ({
      ...x,
      type: p.type,
      subject: p.subject,
      htmlContent: p.htmlContent,
      textContent: p.textContent,
      description: x.description || p.description,
    }));
    toast.success('Conteúdo do modelo pronto carregado.');
  };

  const salvar = async () => {
    setTentou(true);
    if (Object.keys(erros).length) {
      // Leva à aba do primeiro erro.
      setAba(
        erros.name || erros.subject
          ? 'basico'
          : erros.htmlContent
            ? 'conteudo'
            : 'envio'
      );
      return;
    }
    setSalvando(true);
    try {
      const dados = {
        name: m.name.trim(),
        type: m.type,
        subject: m.subject.trim(),
        htmlContent: m.htmlContent.trim(),
        textContent: m.textContent.trim(),
        description: m.description.trim() || undefined,
        senderName: m.senderName.trim(),
        senderEmail: m.senderEmail.trim(),
        replyToEmail: m.replyToEmail.trim() || undefined,
        isActive: m.isActive,
        isDefault: m.isDefault,
        variables: variaveis,
      };
      if (modelo?.id) await updateTemplate(modelo.id, dados);
      else await createTemplate(dados);
      aoSalvar();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Não foi possível salvar.');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <Sheet
      aberto
      aoFechar={aoFechar}
      titulo={modelo?.id ? 'Editar modelo' : 'Novo modelo'}
      descricao={modelo?.id ? m.name : 'O desenho de um tipo de e-mail.'}
      largura="g"
      rodape={
        <>
          <Button
            tamanho="p"
            icone={PiEye}
            onClick={() => setVendo(true)}
            disabled={!m.htmlContent.trim()}
            className="mr-auto"
          >
            Prévia
          </Button>
          <Button tamanho="p" variante="fantasma" onClick={aoFechar}>
            Cancelar
          </Button>
          <Button
            tamanho="p"
            variante="primario"
            onClick={salvar}
            carregando={salvando}
          >
            {modelo?.id ? 'Salvar' : 'Criar modelo'}
          </Button>
        </>
      }
    >
      <Stack gap={6}>
        <Segmentos
          rotulo="Parte do modelo"
          valor={aba}
          aoMudar={setAba}
          opcoes={[
            { valor: 'basico', rotulo: 'Básico' },
            { valor: 'conteudo', rotulo: 'Conteúdo' },
            { valor: 'envio', rotulo: 'Envio' },
          ]}
        />

        {aba === 'basico' && (
          <Stack gap={4}>
            <Field
              label="Nome"
              ajuda="Só no painel; quem recebe não vê."
              value={m.name}
              onChange={(e) => muda('name')(e.target.value)}
              erro={mostrar('name')}
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field.Selecao
                label="Tipo"
                value={m.type}
                onChange={(e) => muda('type')(e.target.value)}
              >
                {TIPOS.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </Field.Selecao>
              <Field.Selecao
                label="Começar de um modelo pronto"
                ajuda="Troca assunto e conteúdo."
                value=""
                onChange={(e) => partirDe(e.target.value)}
              >
                <option value="">Escolha…</option>
                {MODELOS_PRONTOS.map((p) => (
                  <option key={p.type} value={p.type}>
                    {p.rotulo}
                  </option>
                ))}
              </Field.Selecao>
            </div>
            <Field
              label="Assunto"
              ajuda="Pode usar variáveis, como {{firstName}}."
              value={m.subject}
              onChange={(e) => muda('subject')(e.target.value)}
              erro={mostrar('subject')}
            />
            <Field.Area
              label="Descrição (opcional)"
              rows={2}
              value={m.description}
              onChange={(e) => muda('description')(e.target.value)}
            />
          </Stack>
        )}

        {aba === 'conteudo' && (
          <Stack gap={4}>
            <Field.Area
              label="HTML"
              ajuda="Só o corpo da carta: selo, data, assinatura e descadastro entram sozinhos. Um <h1> vira o título."
              rows={16}
              classeCampo="t-dado text-xs"
              spellCheck={false}
              value={m.htmlContent}
              onChange={(e) => muda('htmlContent')(e.target.value)}
              erro={mostrar('htmlContent')}
            />
            <Field.Area
              label="Versão só texto"
              ajuda="Para quem lê e-mail sem HTML. Em branco, o provedor gera uma."
              rows={6}
              value={m.textContent}
              onChange={(e) => muda('textContent')(e.target.value)}
            />
            <Stack gap={1}>
              <Text papel="legenda" as="p">
                Variáveis encontradas ({variaveis.length})
              </Text>
              <p className="t-dado text-xs text-texto-suave">
                {variaveis.length
                  ? variaveis.map((v) => `{{${v}}}`).join('  ')
                  : 'Nenhuma.'}
              </p>
            </Stack>
          </Stack>
        )}

        {aba === 'envio' && (
          <Stack gap={4}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field
                label="Nome de quem envia"
                value={m.senderName}
                onChange={(e) => muda('senderName')(e.target.value)}
              />
              <Field
                type="email"
                label="E-mail de quem envia"
                value={m.senderEmail}
                onChange={(e) => muda('senderEmail')(e.target.value)}
                erro={mostrar('senderEmail')}
              />
              <Field
                type="email"
                label="Responder para (opcional)"
                value={m.replyToEmail}
                onChange={(e) => muda('replyToEmail')(e.target.value)}
                erro={mostrar('replyToEmail')}
              />
            </div>
            <Interruptor
              rotulo="Em uso"
              ajuda="Desligado, não aparece para escolher numa campanha."
              ligado={m.isActive}
              aoMudar={muda('isActive')}
            />
            <Interruptor
              rotulo="Padrão do tipo"
              ajuda="O que o sistema usa quando envia este tipo sozinho (boas-vindas, troca de senha)."
              ligado={m.isDefault}
              aoMudar={muda('isDefault')}
            />
          </Stack>
        )}
      </Stack>

      <PreviaDeEmail
        aberto={vendo}
        aoFechar={() => setVendo(false)}
        titulo={m.name || 'Prévia do modelo'}
        assunto={m.subject}
        html={m.htmlContent}
        texto={m.textContent}
        variaveis={variaveis}
      />
    </Sheet>
  );
}
