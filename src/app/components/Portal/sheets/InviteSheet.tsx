'use client';

// Convidar aluno — busca a conta (o convite é para quem já tem conta no Opus
// Atlas), o plano de estudo e, se o professor quiser, "Evitar verificação":
// o vínculo nasce aceito, sem e-mail de confirmação, e o aluno recebe o aviso
// no portal (escolha de 04/10: só para conta que já existe).

import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Chip } from '@/app/components/ui/Badge';
import { Button } from '@/app/components/ui/Button';
import { Field } from '@/app/components/ui/Field';
import { Sheet } from '@/app/components/ui/Sheet';
import { errorText, usePortalMutation } from '@/app/hooks/portal/query';
import { ApiError } from '@/app/libs/api/client';
import * as api from '@/app/requests/portal/api';
import { duration } from '../format';
import { Avatar, Options, SearchBox } from '../pieces';
import type { SheetProps } from '../PortalProvider';
import { useDebounced } from '../useDebounced';

const DAYS: Array<[string, string]> = [
  ['monday', 'seg'],
  ['tuesday', 'ter'],
  ['wednesday', 'qua'],
  ['thursday', 'qui'],
  ['friday', 'sex'],
  ['saturday', 'sáb'],
  ['sunday', 'dom'],
];

type Person = Awaited<ReturnType<typeof api.searchInvitable>>['users'][number];

export default function InviteSheet({ onClose, closeAll, open }: SheetProps) {
  const [term, setTerm] = useState('');
  const q = useDebounced(term.trim(), 350);
  const [person, setPerson] = useState<Person | null>(null);
  const [perWeek, setPerWeek] = useState(1);
  const [length, setLength] = useState(60);
  const [days, setDays] = useState<Set<string>>(new Set());
  const [focus, setFocus] = useState('');
  const [skip, setSkip] = useState(false);
  const [limitHit, setLimitHit] = useState(false);

  const search = useQuery({
    queryKey: ['portal', 'invitable', q],
    queryFn: () => api.searchInvitable(q),
    enabled: q.length >= 3 && !person,
    staleTime: 30_000,
  });

  const name = person
    ? [person.firstName, person.lastName].filter(Boolean).join(' ') ||
      person.email ||
      ''
    : '';

  const invite = usePortalMutation(
    () =>
      api.inviteStudent({
        studentUserId: person!.id,
        skipVerification: skip || undefined,
        maxLessonsPerWeek: perWeek,
        lessonDuration: length,
        preferredDays: [...days],
        currentFocus: focus
          .split(',')
          .map((f) => f.trim())
          .filter(Boolean),
      }),
    {
      success: skip
        ? `${name} já é seu aluno. Ele recebeu o aviso no portal.`
        : `Convite enviado para ${name}. Ele aceita pelo e-mail ou pelo portal.`,
      onSuccess: closeAll,
      // Limite de alunos do plano: a folha mostra o caminho em vez de só um aviso.
      onError: (e) => {
        if (e instanceof ApiError && e.status === 403) {
          setLimitHit(true);
          return true;
        }
      },
    }
  );

  return (
    <Sheet
      aberto
      aoFechar={onClose}
      titulo="Convidar aluno"
      descricao="O convite vai para quem já tem conta no Opus Atlas. Pendente, ele não ocupa vaga do plano."
      largura="m"
      rodape={
        <>
          <Button variante="fantasma" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            variante="primario"
            disabled={!person}
            carregando={invite.isPending}
            onClick={() => invite.mutate(undefined)}
          >
            {skip ? 'Adicionar aluno' : 'Enviar convite'}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-6">
        {person ? (
          <div className="flex items-center gap-3 rounded-card bg-sup-2 p-4">
            <Avatar name={name} image={person.image} />
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="truncate font-medium">{name}</span>
              <span className="t-legenda truncate">{person.email}</span>
            </span>
            <Button variante="texto" onClick={() => setPerson(null)}>
              Trocar
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <SearchBox
              value={term}
              onChange={setTerm}
              label="Nome ou e-mail do aluno"
            />
            {q.length > 0 && q.length < 3 ? (
              <p className="t-legenda">Digite ao menos 3 letras.</p>
            ) : search.error ? (
              <p className="text-sm text-erro">{errorText(search.error)}</p>
            ) : search.data && search.data.users.length === 0 ? (
              <p className="text-sm text-texto-suave">
                Ninguém com esse nome ou e-mail. O aluno precisa criar a conta
                (é grátis) e depois você convida.
              </p>
            ) : (
              <ul className="flex flex-col" aria-busy={search.isFetching}>
                {(search.data?.users ?? []).map((u) => {
                  const n =
                    [u.firstName, u.lastName].filter(Boolean).join(' ') ||
                    u.email ||
                    '';
                  return (
                    <li key={u.id}>
                      <button
                        type="button"
                        onClick={() => setPerson(u)}
                        className="flex w-full items-center gap-3 border-b border-linha py-2.5 text-left transition-colors hover:bg-sup-2/60"
                      >
                        <Avatar name={n} image={u.image} size="p" />
                        <span className="flex min-w-0 flex-col">
                          <span className="truncate text-[0.9375rem] font-medium">
                            {n}
                          </span>
                          <span className="t-legenda truncate">{u.email}</span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        )}

        <Options
          label="Aulas por semana"
          value={perWeek}
          onChange={setPerWeek}
          options={[1, 2, 3].map((n) => ({ value: n, label: String(n) }))}
        />
        <Options
          label="Duração da aula"
          value={length}
          onChange={setLength}
          options={[30, 45, 60, 90].map((m) => ({
            value: m,
            label: duration(m),
          }))}
        />
        <fieldset className="flex flex-col gap-2">
          <legend className="t-rotulo mb-2 font-medium text-texto">
            Dias que prefere
          </legend>
          <div className="flex flex-wrap gap-2">
            {DAYS.map(([id, label]) => (
              <Chip
                key={id}
                selecionado={days.has(id)}
                onClick={() =>
                  setDays((set) => {
                    const next = new Set(set);
                    if (next.has(id)) next.delete(id);
                    else next.add(id);
                    return next;
                  })
                }
              >
                {label}
              </Chip>
            ))}
          </div>
        </fieldset>
        <Field
          label="Foco agora"
          value={focus}
          onChange={(e) => setFocus(e.target.value)}
          placeholder="Leitura à primeira vista, escalas"
          ajuda="Separe por vírgula."
        />

        <label className="flex cursor-pointer items-start gap-3 rounded-controle bg-sup-2 p-4 text-[0.9375rem]">
          <input
            type="checkbox"
            checked={skip}
            onChange={(e) => setSkip(e.target.checked)}
            className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--ouro)]"
          />
          <span className="flex flex-col gap-1">
            <span className="font-medium text-texto">Evitar verificação</span>
            <span className="text-sm text-texto-suave">
              O vínculo já nasce aceito, sem o e-mail de confirmação, e o aluno
              recebe o aviso no portal. Use para quem você já combinou
              pessoalmente. Ocupa vaga do plano na hora.
            </span>
          </span>
        </label>

        {limitHit && (
          <div className="flex flex-col gap-3 rounded-controle bg-sup-2 p-4 text-sm text-texto-suave">
            <span className="font-medium text-texto">
              As vagas do seu plano acabaram.
            </span>
            {errorText(invite.error)}
            <Button
              className="self-start"
              onClick={() => open({ type: 'upgrade' })}
            >
              Ver os planos
            </Button>
          </div>
        )}
      </div>
    </Sheet>
  );
}
