'use client';

import { useEffect, useId, useMemo, useState, type FormEvent } from 'react';
import { toast } from 'react-hot-toast';
import { Interruptor } from '@/app/components/Admin/painel/Campos';
import ConfirmModal from '@/app/components/ConfirmModal';
import { Button } from '@/app/components/ui/Button';
import { Field } from '@/app/components/ui/Field';
import { Sheet } from '@/app/components/ui/Sheet';
import {
  saveVenue,
  type VenueFormValues,
} from '@/app/requests/calendar-requests';

interface CreateVenueModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  editingVenue?:
    | (Partial<Record<keyof VenueFormValues, unknown>> & { id: string })
    | null;
}

const UFS = [
  'AC',
  'AL',
  'AP',
  'AM',
  'BA',
  'CE',
  'DF',
  'ES',
  'GO',
  'MA',
  'MT',
  'MS',
  'MG',
  'PA',
  'PB',
  'PR',
  'PE',
  'PI',
  'RJ',
  'RN',
  'RS',
  'RO',
  'RR',
  'SC',
  'SP',
  'SE',
  'TO',
];

const VAZIO: VenueFormValues = {
  name: '',
  shortName: '',
  city: '',
  state: '',
  country: 'Brasil',
  address: '',
  zipCode: '',
  website: '',
  email: '',
  phone: '',
  capacity: '',
  description: '',
  logoUrl: '',
  coverImageUrl: '',
  isActive: true,
};

function deVenue(v: CreateVenueModalProps['editingVenue']): VenueFormValues {
  if (!v) return VAZIO;
  const texto = (x: unknown) => (typeof x === 'string' ? x : '');
  return {
    ...VAZIO,
    name: texto(v.name),
    shortName: texto(v.shortName),
    city: texto(v.city),
    state: texto(v.state),
    country: texto(v.country) || 'Brasil',
    address: texto(v.address),
    zipCode: texto(v.zipCode),
    website: texto(v.website),
    email: texto(v.email),
    phone: texto(v.phone),
    capacity:
      typeof v.capacity === 'number' ? String(v.capacity) : texto(v.capacity),
    description: texto(v.description),
    logoUrl: texto(v.logoUrl),
    coverImageUrl: texto(v.coverImageUrl),
    isActive: v.isActive !== false,
  };
}

type Erros = Partial<Record<keyof VenueFormValues, string>>;

function validar(v: VenueFormValues): Erros {
  const erros: Erros = {};
  const nome = v.name.trim();
  if (nome.length < 3) erros.name = 'Dê um nome de ao menos 3 letras.';
  else if (nome.length > 200) erros.name = 'No máximo 200 caracteres.';
  if (!v.city.trim()) erros.city = 'Diga a cidade.';
  if (!v.state) erros.state = 'Escolha o estado.';
  if (v.email && !/^\S+@\S+\.\S+$/.test(v.email.trim()))
    erros.email = 'E-mail incompleto.';
  const capacidade = Number(v.capacity);
  if (
    v.capacity &&
    (!Number.isInteger(capacidade) || capacidade < 1 || capacidade > 200_000)
  )
    erros.capacity = 'Um número entre 1 e 200.000.';
  for (const campo of ['website', 'logoUrl', 'coverImageUrl'] as const) {
    if (v[campo] && !/^https?:\/\//.test(v[campo].trim()))
      erros[campo] = 'Comece com https://';
  }
  return erros;
}

/**
 * Cadastrar e editar local da agenda (só administrador).
 *
 * **O estado é escolhido, não digitado.** A API exige a UF em maiúsculas
 * (é ela que decide o fuso em que a agenda mostra os eventos da casa), e o
 * campo de texto livre aceitava "Rio de Janeiro" para depois a API recusar.
 */
export default function CreateVenueModal({
  isOpen,
  onClose,
  onSuccess,
  editingVenue,
}: CreateVenueModalProps) {
  const id = useId();
  const editando = Boolean(editingVenue?.id);
  const original = useMemo(() => deVenue(editingVenue), [editingVenue]);
  const [valores, setValores] = useState<VenueFormValues>(original);
  const [erros, setErros] = useState<Erros>({});
  const [salvando, setSalvando] = useState(false);
  const [confirmarSaida, setConfirmarSaida] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setValores(original);
    setErros({});
  }, [isOpen, original]);

  const mudou = JSON.stringify(valores) !== JSON.stringify(original);

  function mudar<K extends keyof VenueFormValues>(
    campo: K,
    valor: VenueFormValues[K]
  ) {
    setValores((v) => ({ ...v, [campo]: valor }));
    if (erros[campo]) setErros((e) => ({ ...e, [campo]: undefined }));
  }

  function fechar() {
    if (mudou && !salvando) setConfirmarSaida(true);
    else onClose();
  }

  async function salvar(e: FormEvent) {
    e.preventDefault();
    const novos = validar(valores);
    setErros(novos);
    const primeiro = Object.keys(novos)[0];
    if (primeiro) {
      document.getElementById(`${id}-${primeiro}`)?.focus();
      return;
    }
    setSalvando(true);
    try {
      await saveVenue(valores, editingVenue?.id);
      toast.success(editando ? 'Local salvo.' : 'Local criado.');
      onSuccess?.();
      onClose();
    } catch (falha) {
      toast.error(
        falha instanceof Error ? falha.message : 'Não deu para salvar o local.'
      );
    } finally {
      setSalvando(false);
    }
  }

  const campo = (nome: keyof VenueFormValues) => ({
    id: `${id}-${nome}`,
    erro: erros[nome],
    value: valores[nome] as string,
    onChange: (e: { target: { value: string } }) => mudar(nome, e.target.value),
  });

  return (
    <>
      <Sheet
        aberto={isOpen}
        aoFechar={fechar}
        titulo={editando ? 'Editar local' : 'Novo local'}
        descricao="Sala de concerto, teatro, igreja: onde os eventos acontecem."
        largura="g"
        rodape={
          <>
            <Button variante="fantasma" onClick={fechar}>
              Cancelar
            </Button>
            <Button
              type="submit"
              form={`${id}-form`}
              variante="primario"
              carregando={salvando}
            >
              {editando ? 'Salvar' : 'Criar local'}
            </Button>
          </>
        }
      >
        <form
          id={`${id}-form`}
          onSubmit={salvar}
          noValidate
          className="flex flex-col gap-8"
        >
          <Grupo titulo="O local">
            <div className="grid gap-4 sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
              <Field
                label="Nome"
                placeholder="Ex.: Theatro Municipal do Rio de Janeiro"
                maxLength={200}
                {...campo('name')}
              />
              <Field
                label="Nome curto (opcional)"
                placeholder="Ex.: Municipal"
                {...campo('shortName')}
              />
            </div>
            <Field.Area
              label="Descrição (opcional)"
              rows={3}
              {...campo('description')}
            />
            <Field
              label="Lugares (opcional)"
              type="number"
              inputMode="numeric"
              min={1}
              classeCampo="max-w-40"
              {...campo('capacity')}
            />
            <Interruptor
              rotulo="Ativo"
              ligado={valores.isActive}
              aoMudar={(v) => mudar('isActive', v)}
            />
          </Grupo>

          <Grupo titulo="Endereço">
            <Field
              label="Endereço (opcional)"
              placeholder="Praça Floriano, s/n, Centro"
              {...campo('address')}
            />
            <div className="grid gap-4 sm:grid-cols-[minmax(0,2fr)_6rem_minmax(0,1fr)]">
              <Field label="Cidade" {...campo('city')} />
              <Field.Selecao
                label="UF"
                id={`${id}-state`}
                erro={erros.state}
                value={valores.state}
                onChange={(e) => mudar('state', e.target.value)}
              >
                <option value="">—</option>
                {UFS.map((uf) => (
                  <option key={uf} value={uf}>
                    {uf}
                  </option>
                ))}
              </Field.Selecao>
              <Field
                label="CEP (opcional)"
                inputMode="numeric"
                {...campo('zipCode')}
              />
            </div>
          </Grupo>

          <Grupo titulo="Contato">
            <Field
              label="Site (opcional)"
              type="url"
              inputMode="url"
              placeholder="https://"
              {...campo('website')}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="E-mail (opcional)"
                type="email"
                inputMode="email"
                {...campo('email')}
              />
              <Field
                label="Telefone (opcional)"
                type="tel"
                inputMode="tel"
                {...campo('phone')}
              />
            </div>
          </Grupo>

          <Grupo titulo="Imagens">
            <Field
              label="Logo (opcional)"
              type="url"
              inputMode="url"
              placeholder="https://"
              {...campo('logoUrl')}
            />
            <Field
              label="Foto do local (opcional)"
              type="url"
              inputMode="url"
              placeholder="https://"
              {...campo('coverImageUrl')}
            />
          </Grupo>
        </form>
      </Sheet>

      <ConfirmModal
        isOpen={confirmarSaida}
        onClose={() => setConfirmarSaida(false)}
        onConfirm={() => {
          setConfirmarSaida(false);
          onClose();
        }}
        type="warning"
        title="Sair sem salvar?"
        message="O que foi preenchido neste local se perde."
        confirmText="Sair sem salvar"
        cancelText="Continuar editando"
      />
    </>
  );
}

function Grupo({
  titulo,
  children,
}: {
  titulo: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset className="flex flex-col gap-4">
      <legend className="t-rotulo mb-4 text-texto-fraco">{titulo}</legend>
      {children}
    </fieldset>
  );
}
