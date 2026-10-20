'use client';

import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import {
  PiFloppyDisk,
  PiMagnifyingGlass,
  PiPencilLine,
  PiX,
} from 'react-icons/pi';
import { updateFavorites } from '@/app/actions/profile';
import { Portrait } from '@/app/components/site/Portrait';
import { Button } from '@/app/components/ui/Button';
import { Selecao } from '@/app/components/ui/Selecao';
import { SelecaoComBusca } from '@/app/components/ui/SelecaoComBusca';
import { Text } from '@/app/components/ui/Text';
import { eraName } from '@/app/conteudo/site/eras';
import { PERSONAL } from '@/app/conteudo/site/personal';
import { useAuth } from '@/app/hooks/useAuth';
import { useRouteLanguage } from '@/app/hooks/useRouteLanguage';
import { useSessionUpdate } from '@/app/hooks/useSessionUpdate';
import type { User } from '@/app/hooks/userStore';
import { legacyCatalog } from '@/app/libs/api/compat';
import {
  composerOptions,
  findComposerById,
} from '@/app/requests/catalog-search';

type Props = { user: User; updateUser: (data: Partial<User>) => void };

/**
 * "Favoritos": the composer and the era. The composer is searched across
 * the whole catalogue, the same search as the welcome; the era comes from
 * the catalogue's list.
 */
export default function FavoritesSection({ user, updateUser }: Props) {
  const { language } = useRouteLanguage();
  const t = PERSONAL[language].profile.favorites;
  const { updateUser: updateGlobal } = useAuth();
  const { updateUserSession } = useSessionUpdate();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [composerId, setComposerId] = useState(user.favoriteComposerId ?? '');
  const [composerLabel, setComposerLabel] = useState('');
  const [epochId, setEpochId] = useState(user.favoriteEpochId ?? '');

  useEffect(() => {
    if (editing) return;
    setComposerId(user.favoriteComposerId ?? '');
    setEpochId(user.favoriteEpochId ?? '');
  }, [user.favoriteComposerId, user.favoriteEpochId, editing]);

  const epochs = useQuery({
    queryKey: ['profile-epochs'],
    staleTime: 60 * 60_000,
    queryFn: async () => (await legacyCatalog.musicalOptions()).epochs,
  });
  const composer = useQuery({
    queryKey: ['composer', composerId],
    enabled: !!composerId,
    staleTime: 60 * 60_000,
    queryFn: () => findComposerById(composerId),
  });

  const epoch = epochs.data?.find((e) => e.id === epochId);
  const composerName =
    composerLabel || composer.data?.fullName || composer.data?.name || '';

  const cancel = () => {
    setComposerId(user.favoriteComposerId ?? '');
    setComposerLabel('');
    setEpochId(user.favoriteEpochId ?? '');
    setEditing(false);
  };

  const save = async () => {
    setSaving(true);
    const data = {
      favoriteComposerId: composerId || null,
      favoriteEpochId: epochId || null,
    };
    const result = await updateFavorites(data).catch(() => null);
    setSaving(false);
    if (!result?.success) return toast.error(result?.message ?? t.error);
    updateUser(data);
    updateGlobal(data);
    await updateUserSession();
    setEditing(false);
    toast.success(t.saved);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4 sm:flex-nowrap sm:[&>*:not(:first-child)]:shrink-0">
        <div className="sm:min-w-0 sm:flex-1">
          <h3 className="font-display text-[1.5rem] leading-tight text-texto">
            {t.title}
          </h3>
          <Text papel="rotulo" tom="suave" as="p">
            {t.text}
          </Text>
        </div>
        {!editing ? (
          <Button
            tamanho="p"
            icone={PiPencilLine}
            onClick={() => setEditing(true)}
          >
            {t.edit}
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button
              tamanho="p"
              variante="fantasma"
              icone={PiX}
              onClick={cancel}
              disabled={saving}
            >
              {t.cancel}
            </Button>
            <Button
              tamanho="p"
              variante="primario"
              icone={PiFloppyDisk}
              onClick={save}
              carregando={saving}
            >
              {t.save}
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="flex flex-col gap-2">
          <span id="fav-composer" className="t-rotulo font-medium text-texto">
            {t.composer}
          </span>
          {editing ? (
            <SelecaoComBusca
              buscar={composerOptions}
              valor={composerId}
              rotulo={composerName}
              icone={PiMagnifyingGlass}
              placeholder={t.composerSearch}
              vazio={t.composerEmpty}
              limpavel
              rotuloLimpar={t.clear}
              aria-labelledby="fav-composer"
              aoMudar={(value, option) => {
                setComposerId(value);
                setComposerLabel(option?.label ?? '');
              }}
            />
          ) : composerId && composer.data ? (
            <div className="flex items-center gap-3">
              <Portrait
                name={composer.data.name}
                src={composer.data.portraitUrl ?? null}
                sizes="48px"
                className="h-12 w-12 shrink-0 rounded-full"
              />
              <span className="font-display text-[1.25rem] leading-snug">
                {composerName}
              </span>
            </div>
          ) : composerId && composer.isLoading ? (
            <span
              aria-hidden="true"
              className="loading-skeleton block h-12 rounded-controle"
            />
          ) : (
            <p className="t-rotulo text-texto-fraco">{t.none}</p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <span id="fav-era" className="t-rotulo font-medium text-texto">
            {t.era}
          </span>
          {editing ? (
            <Selecao
              aria-labelledby="fav-era"
              valor={epochId}
              aoMudar={setEpochId}
              disabled={!epochs.data}
              opcoes={[
                { value: '', label: t.eraPlaceholder },
                ...(epochs.data ?? []).map((e) => ({
                  value: e.id,
                  label: eraName(e.name, language),
                })),
              ]}
            />
          ) : epoch ? (
            <span className="font-display text-[1.25rem] leading-snug">
              {eraName(epoch.name, language)}
            </span>
          ) : epochId && epochs.isLoading ? (
            <span
              aria-hidden="true"
              className="loading-skeleton block h-12 rounded-controle"
            />
          ) : (
            <p className="t-rotulo text-texto-fraco">{t.none}</p>
          )}
        </div>
      </div>
    </div>
  );
}
