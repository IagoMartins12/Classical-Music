'use client';

import { useEffect, useId, useMemo, useState, type FormEvent } from 'react';
import { toast } from 'react-hot-toast';
import { Interruptor } from '@/app/components/Admin/painel/Campos';
import ConfirmModal from '@/app/components/ConfirmModal';
import { Chip } from '@/app/components/ui/Badge';
import { Button } from '@/app/components/ui/Button';
import { Field } from '@/app/components/ui/Field';
import { Sheet } from '@/app/components/ui/Sheet';
import { Skeleton } from '@/app/components/ui/Skeleton';
import { BLOG } from '@/app/conteudo/blog';
import {
  loadEventForEdit,
  saveEvent,
  type EventFormValues,
} from '@/app/requests/calendar-requests';

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  venues: Array<{ id: string; name: string; city: string }>;
  /** O evento do calendário (só o `id` é lido: o resto vem da API). */
  editingEvent?: { id: string } | null;
}

const VAZIO: EventFormValues = {
  title: '',
  subtitle: '',
  description: '',
  type: 'CONCERT',
  status: 'PUBLISHED',
  venueId: '',
  room: '',
  startDate: '',
  endDate: '',
  startTime: '',
  endTime: '',
  duration: '',
  doors: '',
  conductor: '',
  ensemble: '',
  ticketUrl: '',
  isFree: false,
  imageUrl: '',
  venueDetails: '',
  ticketInfo: '',
  isFeatured: false,
  featuredOrder: '',
  featuredSize: 'normal',
};

const ESTADOS = [
  { value: 'PUBLISHED', label: 'No ar' },
  { value: 'PENDING', label: 'Esperando revisão' },
  { value: 'DRAFT', label: 'Rascunho' },
  { value: 'POSTPONED', label: 'Adiado' },
  { value: 'CANCELLED', label: 'Cancelado' },
  { value: 'COMPLETED', label: 'Encerrado' },
];

type Erros = Partial<Record<keyof EventFormValues, string>>;

function validar(v: EventFormValues): Erros {
  const erros: Erros = {};
  const titulo = v.title.trim();
  if (titulo.length < 3) erros.title = 'Dê um título de ao menos 3 letras.';
  else if (titulo.length > 300) erros.title = 'No máximo 300 caracteres.';
  if (!v.venueId) erros.venueId = 'Escolha o local.';
  if (!v.startDate) erros.startDate = 'Diga o dia.';
  if (!v.startTime) erros.startTime = 'Diga a hora.';
  if (v.endDate && v.startDate && v.endDate < v.startDate)
    erros.endDate = 'O fim vem antes do começo.';
  for (const campo of ['ticketUrl', 'imageUrl'] as const) {
    if (v[campo] && !/^https?:\/\//.test(v[campo].trim()))
      erros[campo] = 'Comece com https://';
  }
  return erros;
}

/**
 * Cadastrar e editar evento da agenda (só administrador).
 *
 * **Editar lê o evento inteiro da API** (`loadEventForEdit`). O formulário
 * antigo partia do resumo do calendário: abria com dia, hora e local vazios
 * e, ao salvar, apagava regente, sala e subtítulo, que o resumo não traz.
 *
 * Os campos são os que a API aceita, em quatro grupos (o quê, quando e
 * onde, ingressos, imagem). Os erros aparecem no campo e o foco vai para o
 * primeiro; sair com alterações pede confirmação.
 */
export default function CreateEventModal({
  isOpen,
  onClose,
  onSuccess,
  venues,
  editingEvent,
}: CreateEventModalProps) {
  const id = useId();
  const editando = Boolean(editingEvent?.id);
  const [valores, setValores] = useState<EventFormValues>(VAZIO);
  const [original, setOriginal] = useState<EventFormValues>(VAZIO);
  const [erros, setErros] = useState<Erros>({});
  const [carregando, setCarregando] = useState(false);
  const [falhouAoCarregar, setFalhouAoCarregar] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [confirmarSaida, setConfirmarSaida] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setErros({});
    setFalhouAoCarregar(false);
    if (!editingEvent?.id) {
      setValores(VAZIO);
      setOriginal(VAZIO);
      return;
    }
    let vivo = true;
    setCarregando(true);
    loadEventForEdit(editingEvent.id)
      .then((v) => {
        if (!vivo) return;
        setValores(v);
        setOriginal(v);
      })
      .catch(() => vivo && setFalhouAoCarregar(true))
      .finally(() => vivo && setCarregando(false));
    return () => {
      vivo = false;
    };
  }, [isOpen, editingEvent?.id]);

  const mudou = useMemo(
    () => JSON.stringify(valores) !== JSON.stringify(original),
    [valores, original]
  );

  function mudar<K extends keyof EventFormValues>(
    campo: K,
    valor: EventFormValues[K]
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
      await saveEvent(valores, editingEvent?.id);
      toast.success(editando ? 'Evento salvo.' : 'Evento criado.');
      onSuccess?.();
      onClose();
    } catch (falha) {
      toast.error(
        falha instanceof Error ? falha.message : 'Não deu para salvar o evento.'
      );
    } finally {
      setSalvando(false);
    }
  }

  const campo = (nome: keyof EventFormValues) => ({
    id: `${id}-${nome}`,
    erro: erros[nome],
  });

  return (
    <>
      <Sheet
        aberto={isOpen}
        aoFechar={fechar}
        titulo={editando ? 'Editar evento' : 'Novo evento'}
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
              disabled={carregando || falhouAoCarregar}
            >
              {editando ? 'Salvar' : 'Criar evento'}
            </Button>
          </>
        }
      >
        {carregando ? (
          <div className="flex flex-col gap-4" aria-busy="true">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-2/3" />
            <Skeleton className="h-28 w-full" />
          </div>
        ) : falhouAoCarregar ? (
          <p role="alert" className="text-erro">
            Não deu para abrir o evento. Feche e tente de novo.
          </p>
        ) : (
          <form
            id={`${id}-form`}
            onSubmit={salvar}
            noValidate
            className="flex flex-col gap-8"
          >
            <Grupo titulo="O quê">
              <Field
                label="Título"
                {...campo('title')}
                value={valores.title}
                onChange={(e) => mudar('title', e.target.value)}
                placeholder="Ex.: Concerto de Ano Novo"
                maxLength={300}
              />
              <Field
                label="Subtítulo (opcional)"
                {...campo('subtitle')}
                value={valores.subtitle}
                onChange={(e) => mudar('subtitle', e.target.value)}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <Field.Selecao
                  label="Tipo"
                  value={valores.type}
                  onChange={(e) => mudar('type', e.target.value)}
                >
                  {Object.entries(BLOG.pt.agenda.tipos).map(
                    ([valor, rotulo]) => (
                      <option key={valor} value={valor}>
                        {rotulo}
                      </option>
                    )
                  )}
                </Field.Selecao>
                <Field.Selecao
                  label="Estado"
                  value={valores.status}
                  onChange={(e) => mudar('status', e.target.value)}
                >
                  {ESTADOS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </Field.Selecao>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label="Regência (opcional)"
                  value={valores.conductor}
                  onChange={(e) => mudar('conductor', e.target.value)}
                />
                <Field
                  label="Grupo ou solista (opcional)"
                  value={valores.ensemble}
                  onChange={(e) => mudar('ensemble', e.target.value)}
                />
              </div>
              <Field.Area
                label="Descrição (opcional)"
                rows={4}
                maxLength={500}
                value={valores.description}
                onChange={(e) => mudar('description', e.target.value)}
                ajuda={`${valores.description.length} de 500 caracteres.`}
              />
            </Grupo>

            <Grupo titulo="Quando e onde">
              <div className="grid gap-4 sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
                <Field.Selecao
                  label="Local"
                  {...campo('venueId')}
                  value={valores.venueId}
                  onChange={(e) => mudar('venueId', e.target.value)}
                >
                  <option value="">Escolha o local</option>
                  {venues.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name}, {v.city}
                    </option>
                  ))}
                </Field.Selecao>
                <Field
                  label="Sala (opcional)"
                  value={valores.room}
                  onChange={(e) => mudar('room', e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field
                  label="Dia"
                  type="date"
                  {...campo('startDate')}
                  value={valores.startDate}
                  onChange={(e) => mudar('startDate', e.target.value)}
                />
                <Field
                  label="Hora"
                  type="time"
                  {...campo('startTime')}
                  value={valores.startTime}
                  onChange={(e) => mudar('startTime', e.target.value)}
                />
                <Field
                  label="Até o dia (opcional)"
                  type="date"
                  {...campo('endDate')}
                  value={valores.endDate}
                  min={valores.startDate || undefined}
                  onChange={(e) => mudar('endDate', e.target.value)}
                  ajuda="Para temporadas e festivais."
                />
                <Field
                  label="Termina às (opcional)"
                  type="time"
                  value={valores.endTime}
                  onChange={(e) => mudar('endTime', e.target.value)}
                />
              </div>
            </Grupo>

            <Grupo titulo="Ingressos">
              <Interruptor
                rotulo="Entrada gratuita"
                ligado={valores.isFree}
                aoMudar={(v) => mudar('isFree', v)}
              />
              <Field
                label="Onde comprar ou retirar (opcional)"
                type="url"
                inputMode="url"
                {...campo('ticketUrl')}
                value={valores.ticketUrl}
                onChange={(e) => mudar('ticketUrl', e.target.value)}
                placeholder="https://"
              />
              <Field
                label="Preços e observações (opcional)"
                value={valores.ticketInfo}
                onChange={(e) => mudar('ticketInfo', e.target.value)}
                placeholder="Ex.: R$ 40 a R$ 120; meia para estudantes"
              />
            </Grupo>

            <Grupo titulo="Destaque do mês">
              <Interruptor
                rotulo="Mostrar no topo da agenda"
                ajuda="Até três por mês, pelo mês em que o evento começa. Escolher uma posição já ocupada tira o destaque que estava nela."
                ligado={valores.isFeatured}
                aoMudar={(v) => mudar('isFeatured', v)}
              />
              {valores.isFeatured && (
                <div className="flex flex-col gap-4">
                  <fieldset>
                    <legend className="mb-2 text-sm font-medium text-texto">
                      Posição
                    </legend>
                    <div className="flex gap-1.5">
                      <Chip
                        selecionado={!valores.featuredOrder}
                        onClick={() => mudar('featuredOrder', '')}
                      >
                        A primeira livre
                      </Chip>
                      {['1', '2', '3'].map((n) => (
                        <Chip
                          key={n}
                          selecionado={valores.featuredOrder === n}
                          onClick={() => mudar('featuredOrder', n)}
                        >
                          {n}º
                        </Chip>
                      ))}
                    </div>
                  </fieldset>
                </div>
              )}
              {valores.isFeatured && !valores.imageUrl && (
                <p className="t-legenda">
                  Sem imagem, o destaque usa a capa de reserva. Com imagem ele
                  fica bem melhor.
                </p>
              )}
            </Grupo>

            <Grupo titulo="Imagem">
              <Field
                label="Endereço da imagem (opcional)"
                type="url"
                inputMode="url"
                {...campo('imageUrl')}
                value={valores.imageUrl}
                onChange={(e) => mudar('imageUrl', e.target.value)}
                placeholder="https://"
                ajuda="Sem imagem, o evento usa a capa de reserva do blog."
              />
              {/^https?:\/\//.test(valores.imageUrl) && (
                // Prévia do endereço como digitado, antes do otimizador.
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={valores.imageUrl}
                  alt={`Imagem de ${valores.title || 'evento'}`}
                  className="aspect-[16/10] w-full max-w-sm rounded-card bg-sup-2 object-cover"
                />
              )}
            </Grupo>
          </form>
        )}
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
        message="As alterações neste evento se perdem."
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
