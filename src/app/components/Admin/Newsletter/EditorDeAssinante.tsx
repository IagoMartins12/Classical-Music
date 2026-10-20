'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Button } from '@/app/components/ui/Button';
import { Field } from '@/app/components/ui/Field';
import { Stack } from '@/app/components/ui/Layout';
import { Sheet } from '@/app/components/ui/Sheet';

/**
 * Editar um assinante da newsletter: nome, estado, frequência e interesses.
 *
 * Era um dos três modais de `SubscriberModals` — os outros dois (detalhes e
 * "enviar e-mail individual") não eram usados por tela nenhuma e saíram.
 */

const ESTADOS = [
  { value: 'ACTIVE', label: 'Ativo' },
  { value: 'PENDING', label: 'Esperando confirmação' },
  { value: 'UNSUBSCRIBED', label: 'Saiu' },
  { value: 'BOUNCED', label: 'E-mail devolvido' },
  { value: 'BLOCKED', label: 'Bloqueado' },
];

const FREQUENCIAS = [
  { value: 'daily', label: 'Diária' },
  { value: 'weekly', label: 'Semanal' },
  { value: 'monthly', label: 'Mensal' },
];

export interface AssinanteEditavel {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  status?: string;
  frequency?: string | null;
  interests?: string[] | null;
}

export function EditorDeAssinante({
  assinante: a,
  aoFechar,
  aoSalvar,
}: {
  assinante: AssinanteEditavel | null;
  aoFechar: () => void;
  aoSalvar: (id: string, dados: Record<string, unknown>) => Promise<void>;
}) {
  const [nome, setNome] = useState('');
  const [sobrenome, setSobrenome] = useState('');
  const [estado, setEstado] = useState('ACTIVE');
  const [frequencia, setFrequencia] = useState('weekly');
  const [interesses, setInteresses] = useState('');
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (!a) return;
    setNome(a.firstName ?? '');
    setSobrenome(a.lastName ?? '');
    setEstado(a.status ?? 'ACTIVE');
    setFrequencia(a.frequency ?? 'weekly');
    setInteresses((a.interests ?? []).join(', '));
  }, [a]);

  const salvar = async () => {
    if (!a) return;
    setSalvando(true);
    try {
      await aoSalvar(a.id, {
        firstName: nome.trim(),
        lastName: sobrenome.trim(),
        status: estado,
        frequency: frequencia,
        interests: interesses
          .split(',')
          .map((i) => i.trim())
          .filter(Boolean),
      });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Não foi possível salvar.');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <Sheet
      aberto={!!a}
      aoFechar={aoFechar}
      titulo="Editar assinante"
      descricao={a?.email}
      largura="m"
      rodape={
        <>
          <Button tamanho="p" variante="fantasma" onClick={aoFechar}>
            Cancelar
          </Button>
          <Button
            tamanho="p"
            variante="primario"
            onClick={salvar}
            carregando={salvando}
          >
            Salvar
          </Button>
        </>
      }
    >
      <Stack gap={4}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field
            label="Nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
          />
          <Field
            label="Sobrenome"
            value={sobrenome}
            onChange={(e) => setSobrenome(e.target.value)}
          />
          <Field.Selecao
            label="Estado"
            ajuda="“Saiu” para de receber; “Bloqueado” não volta sozinho."
            value={estado}
            onChange={(e) => setEstado(e.target.value)}
          >
            {ESTADOS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </Field.Selecao>
          <Field.Selecao
            label="Frequência"
            value={frequencia}
            onChange={(e) => setFrequencia(e.target.value)}
          >
            {FREQUENCIAS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </Field.Selecao>
        </div>
        <Field.Area
          label="Interesses"
          ajuda="Separados por vírgula."
          placeholder="Piano, violão, barroco"
          rows={3}
          value={interesses}
          onChange={(e) => setInteresses(e.target.value)}
        />
      </Stack>
    </Sheet>
  );
}
