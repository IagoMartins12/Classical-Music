'use client';

import { useState } from 'react';
import { PiPlus, PiX } from 'react-icons/pi';
import { Button } from '@/app/components/ui/Button';
import { Field } from '@/app/components/ui/Field';
import { Stack } from '@/app/components/ui/Layout';
import { Sheet } from '@/app/components/ui/Sheet';
import { Text } from '@/app/components/ui/Text';
import type {
  ModelField,
  ModelSchema,
} from '@/app/hooks/admin/useDatabaseStudio';

/**
 * Filtros do Database Studio: campo, operador e valor, com o operador e o
 * controle certos para o tipo do campo. Os filtros ligados aparecem em cima,
 * cada um com o X para tirar.
 *
 * Era um modal com duas caixas por dentro, botões e campos antigos; e o
 * operador "em (vários)" mandava o texto digitado em vez de uma lista.
 */

interface FilterPanelProps {
  isOpen: boolean;
  onClose: () => void;
  availableFields: string[];
  activeFilters: Record<string, unknown>;
  modelSchema: ModelSchema | null;
  onAddFilter: (field: string, value: unknown) => void;
  onRemoveFilter: (field: string) => void;
  onClearFilters: () => void;
  onApply: () => void;
}

type Operador = { value: string; label: string };

const OPERADORES_TEXTO: Operador[] = [
  { value: 'equals', label: 'Igual a' },
  { value: 'contains', label: 'Contém' },
  { value: 'startsWith', label: 'Começa com' },
  { value: 'endsWith', label: 'Termina com' },
  { value: 'not', label: 'Diferente de' },
  { value: 'in', label: 'Um destes (separe por vírgula)' },
];
const OPERADORES_NUMERO: Operador[] = [
  { value: 'equals', label: 'Igual a' },
  { value: 'gt', label: 'Maior que' },
  { value: 'gte', label: 'Maior ou igual' },
  { value: 'lt', label: 'Menor que' },
  { value: 'lte', label: 'Menor ou igual' },
  { value: 'not', label: 'Diferente de' },
];
const OPERADORES_DATA: Operador[] = [
  { value: 'gte', label: 'A partir de' },
  { value: 'lte', label: 'Até' },
  { value: 'gt', label: 'Depois de' },
  { value: 'lt', label: 'Antes de' },
];
const OPERADORES_ENUM: Operador[] = [
  { value: 'equals', label: 'Igual a' },
  { value: 'not', label: 'Diferente de' },
  { value: 'in', label: 'Um destes (separe por vírgula)' },
];

function operadoresDe(f: ModelField | undefined): Operador[] {
  if (!f) return [];
  if (f.type === 'Boolean') return [{ value: 'equals', label: 'Igual a' }];
  if (f.type === 'DateTime') return OPERADORES_DATA;
  if (['Int', 'Float', 'Decimal', 'BigInt'].includes(f.type)) {
    return OPERADORES_NUMERO;
  }
  if (f.kind === 'enum') return OPERADORES_ENUM;
  return OPERADORES_TEXTO;
}

export default function FilterPanel({
  isOpen,
  onClose,
  availableFields,
  activeFilters,
  modelSchema,
  onAddFilter,
  onRemoveFilter,
  onClearFilters,
  onApply,
}: FilterPanelProps) {
  const [campo, setCampo] = useState('');
  const [operador, setOperador] = useState('equals');
  const [valor, setValor] = useState('');

  const info = (nome: string) =>
    modelSchema?.fields.find((f) => f.name === nome);
  const f = info(campo);
  const operadores = operadoresDe(f);

  const filtraveis = availableFields.filter((nome) => {
    const i = info(nome);
    return i && !i.isSensitive && activeFilters[nome] === undefined;
  });

  const converter = (v: string): unknown => {
    if (!f) return v;
    if (f.type === 'Boolean') return v === 'true';
    if (['Int', 'BigInt'].includes(f.type)) return parseInt(v, 10);
    if (['Float', 'Decimal'].includes(f.type)) {
      return parseFloat(v.replace(',', '.'));
    }
    if (f.type === 'DateTime') return new Date(v).toISOString();
    return v;
  };

  const adicionar = () => {
    if (!campo || !valor) return;
    const bruto =
      operador === 'in'
        ? valor
            .split(',')
            .map((x) => x.trim())
            .filter(Boolean)
            .map(converter)
        : converter(valor);
    onAddFilter(campo, operador === 'equals' ? bruto : { [operador]: bruto });
    setCampo('');
    setOperador('equals');
    setValor('');
  };

  const descrever = (nome: string, v: unknown): string => {
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      const [op, operando] = Object.entries(v as Record<string, unknown>)[0];
      const rotulo =
        operadoresDe(info(nome)).find((o) => o.value === op)?.label ?? op;
      return `${rotulo}: ${Array.isArray(operando) ? operando.join(', ') : String(operando)}`;
    }
    if (typeof v === 'boolean') return v ? 'Sim' : 'Não';
    return `Igual a: ${String(v)}`;
  };

  const ativos = Object.entries(activeFilters);

  return (
    <Sheet
      aberto={isOpen}
      aoFechar={onClose}
      titulo="Filtros"
      descricao="Só os documentos que casam com todos os filtros."
      largura="m"
      rodape={
        <>
          <Button tamanho="p" variante="fantasma" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            tamanho="p"
            variante="primario"
            onClick={() => {
              onApply();
              onClose();
            }}
          >
            Aplicar
          </Button>
        </>
      }
    >
      <Stack gap={6}>
        {ativos.length > 0 && (
          <Stack gap={2}>
            <div className="flex items-center justify-between">
              <Text papel="rotulo" as="h3" className="font-medium">
                Ligados ({ativos.length})
              </Text>
              <Button tamanho="p" variante="texto" onClick={onClearFilters}>
                Tirar todos
              </Button>
            </div>
            <ul className="flex flex-col divide-y divide-linha rounded-controle bg-sup-2">
              {ativos.map(([nome, v]) => (
                <li key={nome} className="flex items-center gap-3 px-4 py-2">
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="t-dado text-sm text-texto">{nome}</span>
                    <span className="t-legenda truncate">
                      {descrever(nome, v)}
                    </span>
                  </span>
                  <Button
                    tamanho="p"
                    variante="fantasma"
                    icone={PiX}
                    rotulo={`Tirar o filtro de ${nome}`}
                    onClick={() => onRemoveFilter(nome)}
                  />
                </li>
              ))}
            </ul>
          </Stack>
        )}

        <Stack gap={4}>
          <Text papel="rotulo" as="h3" className="font-medium">
            Novo filtro
          </Text>
          {filtraveis.length === 0 ? (
            <Text papel="rotulo" tom="suave" as="p">
              Todos os campos já têm filtro ou são protegidos.
            </Text>
          ) : (
            <>
              <Field.Selecao
                label="Campo"
                value={campo}
                onChange={(e) => {
                  setCampo(e.target.value);
                  setOperador(
                    operadoresDe(info(e.target.value))[0]?.value ?? 'equals'
                  );
                  setValor('');
                }}
              >
                <option value="">Escolha um campo</option>
                {filtraveis.map((n) => (
                  <option key={n} value={n}>
                    {n} ({info(n)?.type})
                  </option>
                ))}
              </Field.Selecao>

              {f && (
                <Field.Selecao
                  label="Condição"
                  value={operador}
                  onChange={(e) => setOperador(e.target.value)}
                >
                  {operadores.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </Field.Selecao>
              )}

              {f &&
                (f.type === 'Boolean' ? (
                  <Field.Selecao
                    label="Valor"
                    value={valor}
                    onChange={(e) => setValor(e.target.value)}
                  >
                    <option value="">Escolha</option>
                    <option value="true">Sim</option>
                    <option value="false">Não</option>
                  </Field.Selecao>
                ) : f.kind === 'enum' &&
                  f.enumValues?.length &&
                  operador !== 'in' ? (
                  <Field.Selecao
                    label="Valor"
                    value={valor}
                    onChange={(e) => setValor(e.target.value)}
                  >
                    <option value="">Escolha</option>
                    {f.enumValues.map((v) => (
                      <option key={v} value={v}>
                        {v}
                      </option>
                    ))}
                  </Field.Selecao>
                ) : (
                  <Field
                    label="Valor"
                    type={
                      f.type === 'DateTime'
                        ? 'datetime-local'
                        : ['Int', 'Float', 'Decimal', 'BigInt'].includes(
                              f.type
                            ) && operador !== 'in'
                          ? 'number'
                          : 'text'
                    }
                    value={valor}
                    onChange={(e) => setValor(e.target.value)}
                    ajuda={
                      f.kind === 'enum' && f.enumValues?.length
                        ? `Valores: ${f.enumValues.join(', ')}`
                        : undefined
                    }
                  />
                ))}

              <Button
                tamanho="p"
                icone={PiPlus}
                onClick={adicionar}
                disabled={!campo || !valor}
                className="self-start"
              >
                Adicionar filtro
              </Button>
            </>
          )}
        </Stack>
      </Stack>
    </Sheet>
  );
}
