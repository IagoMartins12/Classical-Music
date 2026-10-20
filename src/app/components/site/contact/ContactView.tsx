'use client';

import { useEffect, useState, type FormEvent } from 'react';
import {
  PiBooks,
  PiBug,
  PiEnvelopeSimple,
  PiHandshake,
  PiQuestion,
} from 'react-icons/pi';
import type { IconType } from 'react-icons';
import Link from '@/app/components/LocalizedLink';
import { Button } from '@/app/components/ui/Button';
import { CaixaDeMarcar } from '@/app/components/ui/CaixaDeMarcar';
import { Field } from '@/app/components/ui/Field';
import { Icon } from '@/app/components/ui/Icon';
import { VistoQueSeDesenha } from '@/app/components/ui/VistoQueSeDesenha';
import { cx } from '@/app/components/ui/cx';
import { CONTACT, type Assunto } from '@/app/conteudo/site/contact';
import type { Idioma } from '@/app/conteudo/legal/tipos';
import { useAuth } from '@/app/hooks/useAuth';
import { connectionError } from '@/app/libs/api/client';
import { submitContact } from '@/app/requests/contact';
import { CONTATO, mailto } from '@/app/utils/contato';

const ICONES: Record<Assunto, IconType> = {
  suporte: PiQuestion,
  bug: PiBug,
  moderacao: PiBooks,
  parceria: PiHandshake,
};
const ASSUNTOS = Object.keys(ICONES) as Assunto[];
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Erros = Partial<Record<'nome' | 'email' | 'assunto' | 'mensagem', string>>;

/**
 * The contact page: what it is about, the message, and the other ways in.
 * A task page — the form leads, the channels sit beside it. Signed-in
 * people find their name and email already there.
 */
export function ContactView({ idioma }: { idioma: Idioma }) {
  const t = CONTACT[idioma];
  const { user } = useAuth();
  const [sobre, setSobre] = useState<Assunto>('suporte');
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [assunto, setAssunto] = useState(t.assuntos.suporte.assunto);
  const [assuntoTocado, setAssuntoTocado] = useState(false);
  const [mensagem, setMensagem] = useState('');
  const [newsletter, setNewsletter] = useState(false);
  const [erros, setErros] = useState<Erros>({});
  const [enviando, setEnviando] = useState(false);
  const [falha, setFalha] = useState<string | null>(null);
  const [enviado, setEnviado] = useState<{
    email: string;
    protocolo?: string;
  } | null>(null);

  // Signed in: the name and email are already known.
  useEffect(() => {
    if (!user) return;
    setNome(
      (n) =>
        n ||
        [user.firstName, user.lastName].filter(Boolean).join(' ') ||
        user.name ||
        ''
    );
    setEmail((e) => e || user.email || '');
  }, [user]);

  const escolher = (a: Assunto) => {
    setSobre(a);
    // The suggested subject follows, until the person writes their own.
    if (!assuntoTocado) setAssunto(t.assuntos[a].assunto);
  };

  const validar = (): Erros => {
    const e: Erros = {};
    if (!nome.trim()) e.nome = t.obrigatorio;
    if (!email.trim()) e.email = t.obrigatorio;
    else if (!EMAIL.test(email.trim())) e.email = t.emailInvalido;
    if (!assunto.trim()) e.assunto = t.obrigatorio;
    if (mensagem.trim().length < 10)
      e.mensagem = mensagem.trim() ? t.curta : t.obrigatorio;
    return e;
  };

  const enviar = async (ev: FormEvent) => {
    ev.preventDefault();
    const e = validar();
    setErros(e);
    setFalha(null);
    if (Object.keys(e).length) {
      document.getElementById(`contato-${Object.keys(e)[0]}`)?.focus();
      return;
    }
    setEnviando(true);
    try {
      const r = await submitContact({
        name: nome.trim(),
        email: email.trim(),
        subject: assunto.trim(),
        message: mensagem.trim(),
        category: sobre,
        priority: sobre === 'bug' ? 'alta' : 'normal',
        subscribeNewsletter: newsletter,
        sourceUrl: window.location.href,
        userAgent: navigator.userAgent,
      });
      if (r.success) setEnviado({ email: email.trim(), protocolo: r.ticketId });
      else setFalha(r.error || r.message);
    } catch {
      setFalha(connectionError());
    } finally {
      setEnviando(false);
    }
  };

  const outra = () => {
    setEnviado(null);
    setMensagem('');
    setAssuntoTocado(false);
    setAssunto(t.assuntos[sobre].assunto);
  };

  return (
    <div className="section-wrap pb-20 pt-8 md:pt-12">
      <header className="max-w-[var(--largura-texto)]">
        <h1 className="entra classical-title text-4xl leading-[1.1] text-texto md:text-[3.25rem]">
          {t.titulo}
        </h1>
        <p
          className="entra mt-5 text-lg leading-relaxed text-texto-suave"
          style={{ ['--i' as string]: 1 }}
        >
          {t.abertura}
        </p>
      </header>

      <div className="mt-12 grid gap-12 lg:grid-cols-[minmax(0,7fr)_minmax(0,4fr)] lg:gap-16">
        {enviado ? (
          <section
            role="status"
            className="flex flex-col items-start gap-4 rounded-card bg-sup-2 p-8"
          >
            <span className="grid h-14 w-14 place-items-center rounded-full tint-ouro text-ouro-na-tinta">
              <VistoQueSeDesenha className="h-7 w-7" />
            </span>
            <h2 className="font-display text-[2rem] leading-tight">
              {t.enviadoTitulo}
            </h2>
            <p className="t-corpo text-texto-suave">
              {t.enviadoTexto(enviado.email)}
            </p>
            {enviado.protocolo && (
              <p className="t-dado text-[0.875rem] text-texto-fraco">
                {t.protocolo(enviado.protocolo)}
              </p>
            )}
            <Button onClick={outra}>{t.outra}</Button>
          </section>
        ) : (
          <form onSubmit={enviar} noValidate className="flex flex-col gap-8">
            <fieldset className="flex flex-col gap-4">
              <legend className="mb-4 font-display text-[1.5rem]">
                {t.sobre}
              </legend>
              <div role="radiogroup" className="grid gap-3 sm:grid-cols-2">
                {ASSUNTOS.map((a) => {
                  const ativo = sobre === a;
                  return (
                    <label
                      key={a}
                      className={cx(
                        'group relative flex cursor-pointer items-start gap-3 rounded-card p-4 transition-colors duration-[var(--t-toque)]',
                        'has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-[var(--ouro)]',
                        ativo
                          ? 'tint-ouro shadow-[inset_0_0_0_1px_var(--ouro)]'
                          : 'bg-sup-2 hover:bg-[var(--interactive-hover)]'
                      )}
                    >
                      <input
                        type="radio"
                        name="sobre"
                        value={a}
                        checked={ativo}
                        onChange={() => escolher(a)}
                        className="sr-only"
                      />
                      <span
                        className={cx(
                          'grid h-10 w-10 shrink-0 place-items-center rounded-full',
                          ativo
                            ? 'bg-[var(--fundo)] text-ouro-texto'
                            : 'bg-[var(--fundo)] text-texto-suave'
                        )}
                      >
                        <Icon de={ICONES[a]} tamanho="m" />
                      </span>
                      <span className="flex flex-col gap-0.5">
                        <span
                          className={cx(
                            'font-medium',
                            ativo ? 'text-ouro-na-tinta' : 'text-texto'
                          )}
                        >
                          {t.assuntos[a].nome}
                        </span>
                        <span className="t-rotulo text-texto-suave">
                          {t.assuntos[a].texto}
                        </span>
                      </span>
                    </label>
                  );
                })}
              </div>
            </fieldset>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field
                id="contato-nome"
                label={t.nome}
                autoComplete="name"
                value={nome}
                erro={erros.nome}
                onChange={(e) => setNome(e.target.value)}
              />
              <Field
                id="contato-email"
                label={t.email}
                type="email"
                autoComplete="email"
                value={email}
                erro={erros.email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <Field
              id="contato-assunto"
              label={t.assunto}
              value={assunto}
              erro={erros.assunto}
              onChange={(e) => {
                setAssunto(e.target.value);
                setAssuntoTocado(true);
              }}
            />
            <Field.Area
              id="contato-mensagem"
              label={t.mensagem}
              ajuda={t.mensagemDica[sobre]}
              value={mensagem}
              erro={erros.mensagem}
              rows={7}
              maxLength={5000}
              onChange={(e) => setMensagem(e.target.value)}
            />
            <CaixaDeMarcar
              rotulo={t.newsletter}
              marcado={newsletter}
              aoMudar={setNewsletter}
            />

            {falha && (
              <p role="alert" className="t-rotulo text-erro">
                {falha}
              </p>
            )}
            <div>
              <Button
                type="submit"
                variante="primario"
                carregando={enviando}
                className="max-sm:w-full"
              >
                {t.enviar}
              </Button>
            </div>
          </form>
        )}

        <aside className="flex flex-col gap-10 lg:pt-14">
          <section className="flex flex-col gap-4">
            <h2 className="font-display text-[1.375rem]">{t.canais}</h2>
            <ul className="flex flex-col divide-y divide-[var(--linha)]">
              {(
                [
                  ['contato', t.canalContato],
                  ['suporte', t.canalSuporte],
                  ['privacidade', t.canalPrivacidade],
                ] as const
              ).map(([canal, rotulo]) => (
                <li key={canal}>
                  <a
                    href={mailto(canal)}
                    className="group flex items-center gap-3 py-3"
                  >
                    <Icon de={PiEnvelopeSimple} className="text-ouro-texto" />
                    <span className="flex min-w-0 flex-col">
                      <span className="t-rotulo text-texto-suave">
                        {rotulo}
                      </span>
                      <span className="truncate text-texto underline decoration-transparent underline-offset-4 transition-colors group-hover:decoration-[var(--ouro)]">
                        {CONTATO[canal]}
                      </span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </section>
          <section className="flex flex-col gap-3">
            <h2 className="font-display text-[1.375rem]">{t.antes}</h2>
            <Link
              href="/help"
              className="t-corpo text-texto underline decoration-[var(--linha-forte)] underline-offset-4 hover:decoration-[var(--ouro)]"
            >
              {t.ajuda}
            </Link>
            <Link
              href="/faq"
              className="t-corpo text-texto underline decoration-[var(--linha-forte)] underline-offset-4 hover:decoration-[var(--ouro)]"
            >
              {t.faq}
            </Link>
          </section>
        </aside>
      </div>
    </div>
  );
}
