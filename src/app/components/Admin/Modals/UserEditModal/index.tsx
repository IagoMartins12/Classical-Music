'use client';

import { useState } from 'react';
import { PiChalkboardTeacher, PiShield, PiWarning } from 'react-icons/pi';
import { Button } from '@/app/components/ui/Button';
import { Field } from '@/app/components/ui/Field';
import { Inline, Stack } from '@/app/components/ui/Layout';
import { Sheet } from '@/app/components/ui/Sheet';
import type { AdminUser } from '@/app/requests/admin/users';
import { updateAdminUser } from '@/app/requests/admin/users';

/**
 * Editar um usuário no painel: o papel no sistema e o papel de professor —
 * duas coisas diferentes.
 *
 * **O defeito que havia aqui.** A lista de papéis tinha "Professor" com valor
 * 1, e 1 é o nível de **administrador**: escolher "Professor" dava acesso ao
 * painel e nunca enviava o convite, porque a API convida quando recebe
 * `isTeacher: true`. Agora o papel no sistema é só acesso (usuário, admin,
 * super admin) e "professor" é uma chave à parte, que envia o convite.
 *
 * **O convite pode levar um plano** (Mentor ou Maestro), com vencimento
 * opcional. O plano é concedido quando a pessoa aceita. Quem assina um plano
 * para professores vira professor sozinho, sem convite.
 */
interface UserEditModalProps {
  user: AdminUser;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedUser: AdminUser) => void;
}

/**
 * Os papéis que a API reconhece (`common/auth/roles.ts`): 0 é pessoa comum,
 * 2 é administrador. **O 1 não abre o painel** — é o professor do legado, e
 * ser professor hoje é a chave de baixo (`isTeacher`). Esta lista oferecia
 * "Administrador (1): acesso ao painel" e "Super admin (2)" até 29/09/2026:
 * quem escolhia o primeiro achava que tinha dado acesso, e não tinha; e não
 * existe nível acima de 2.
 */
const PAPEIS = [
  { value: 0, label: 'Pessoa', ajuda: 'Usa o site; não abre o painel.' },
  {
    value: 2,
    label: 'Administrador',
    ajuda: 'Abre o painel inteiro: catálogo, pessoas, cobrança e sistema.',
  },
] as const;

type PlanoConvite = '' | 'MENTOR' | 'MAESTRO';

const hoje = () => new Date().toISOString().slice(0, 10);

export default function UserEditModal({
  user,
  isOpen,
  onClose,
  onSave,
}: UserEditModalProps) {
  // Conta ainda com o nível 1 do legado aparece como "Pessoa": ele não dá
  // acesso a nada.
  const papelAtual = user.role === 2 ? 2 : 0;
  const jaProfessor = Boolean(user.isTeacher);
  const [papel, setPapel] = useState<number>(papelAtual);
  const [professor, setProfessor] = useState(jaProfessor);
  const [plano, setPlano] = useState<PlanoConvite>('');
  const [vencimento, setVencimento] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const convidando = professor && !jaProfessor;
  const removendoProfessor = !professor && jaProfessor;
  const mudou = papel !== papelAtual || professor !== jaProfessor;

  async function salvar() {
    if (!mudou) {
      onClose();
      return;
    }
    setSalvando(true);
    setErro(null);
    try {
      const atualizado = await updateAdminUser(user.id, {
        role: papel !== papelAtual ? papel : undefined,
        isTeacher: professor !== jaProfessor ? professor : undefined,
        teacherPlanGrant:
          convidando && plano
            ? {
                planType: plano,
                // Fim do dia escolhido, no horário de Brasília.
                expiresAt: vencimento
                  ? new Date(`${vencimento}T23:59:59-03:00`).toISOString()
                  : null,
              }
            : undefined,
      });
      onSave({ ...user, ...atualizado });
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Não foi possível salvar.');
    } finally {
      setSalvando(false);
    }
  }

  return (
    <Sheet
      aberto={isOpen}
      aoFechar={onClose}
      titulo="Papel e professor"
      descricao={`${user.name || user.email}${user.name && user.email ? ` · ${user.email}` : ''}`}
      largura="m"
      rodape={
        <>
          <Button
            tamanho="p"
            variante="fantasma"
            onClick={onClose}
            disabled={salvando}
          >
            Cancelar
          </Button>
          <Button
            tamanho="p"
            variante="primario"
            onClick={salvar}
            carregando={salvando}
            disabled={!mudou}
          >
            {convidando ? 'Salvar e enviar convite' : 'Salvar'}
          </Button>
        </>
      }
    >
      <Stack gap={8}>
        {erro && (
          <Inline
            gap={2}
            alinhar="inicio"
            className="rounded-controle bg-sup-2 p-4 text-erro"
          >
            <PiWarning aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0" />
            <span>{erro}</span>
          </Inline>
        )}

        {/* Papel no sistema: nível de acesso, nada a ver com dar aulas. */}
        <fieldset>
          <legend className="mb-3 flex items-center gap-2 font-semibold text-texto">
            <PiShield aria-hidden="true" className="h-5 w-5 text-ouro-texto" />
            Papel no sistema
          </legend>
          <div className="flex flex-col gap-2">
            {PAPEIS.map((p) => (
              <label
                key={p.value}
                className="flex cursor-pointer items-start gap-3 rounded-controle bg-sup-2 px-4 py-3 has-[:checked]:text-ouro-texto"
              >
                <input
                  type="radio"
                  name="papel"
                  value={p.value}
                  checked={papel === p.value}
                  onChange={() => setPapel(p.value)}
                  className="mt-1 h-4 w-4 accent-[var(--ouro)]"
                />
                <span>
                  <span className="block font-medium">{p.label}</span>
                  <span className="block text-sm text-texto-suave">
                    {p.ajuda}
                  </span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        {/* Professor: chave à parte, que envia o convite. */}
        <fieldset>
          <legend className="mb-3 flex items-center gap-2 font-semibold text-texto">
            <PiChalkboardTeacher
              aria-hidden="true"
              className="h-5 w-5 text-ouro-texto"
            />
            Professor
          </legend>

          <label className="flex cursor-pointer items-start gap-3 rounded-controle bg-sup-2 px-4 py-3">
            <input
              type="checkbox"
              checked={professor}
              onChange={(e) => setProfessor(e.target.checked)}
              className="mt-1 h-4 w-4 accent-[var(--ouro)]"
            />
            <span>
              <span className="block font-medium text-texto">
                {jaProfessor ? 'É professor' : 'Convidar para ser professor'}
              </span>
              <span className="block text-sm text-texto-suave">
                {jaProfessor
                  ? user.teacherProfile?.status === 'PENDING'
                    ? 'Convite enviado, aguardando o aceite.'
                    : 'Desmarque para remover o papel: o perfil é desativado, e aulas e histórico continuam.'
                  : 'A pessoa recebe um convite por e-mail e vira professor ao aceitar.'}
              </span>
            </span>
          </label>

          {convidando && (
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field.Selecao
                label="Plano de presente"
                ajuda="Concedido quando o convite for aceito."
                value={plano}
                onChange={(e) => setPlano(e.target.value as PlanoConvite)}
              >
                <option value="">Sem plano</option>
                <option value="MENTOR">Mentor (até 7 alunos)</option>
                <option value="MAESTRO">Maestro (alunos ilimitados)</option>
              </Field.Selecao>
              <Field
                type="date"
                label="Vencimento do plano"
                ajuda="Em branco: sem vencimento."
                min={hoje()}
                value={vencimento}
                disabled={!plano}
                onChange={(e) => setVencimento(e.target.value)}
              />
            </div>
          )}

          {removendoProfessor && (
            <p className="mt-3 text-sm text-texto-suave">
              O plano atual da conta não muda.
            </p>
          )}
        </fieldset>
      </Stack>
    </Sheet>
  );
}
