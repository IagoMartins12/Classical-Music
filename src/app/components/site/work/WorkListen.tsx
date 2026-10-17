'use client';

import { useEffect, useRef, useState } from 'react';
import { CaixaDeMarcar } from '@/app/components/ui/CaixaDeMarcar';
import toast from 'react-hot-toast';
import {
  PiMagnifyingGlass,
  PiPause,
  PiPencilSimple,
  PiPlay,
  PiSpotifyLogo,
  PiWaveform,
  PiYoutubeLogo,
} from 'react-icons/pi';
import Image from '@/app/components/SmartImage';
import { Aba, Abas } from '@/app/components/ui/Abas';
import { Button, classesDeBotao } from '@/app/components/ui/Button';
import { Field } from '@/app/components/ui/Field';
import { Icon } from '@/app/components/ui/Icon';
import { Sheet } from '@/app/components/ui/Sheet';
import { WORK } from '@/app/conteudo/site/work';
import { useRouteLanguage } from '@/app/hooks/useRouteLanguage';
import { useSession } from '@/app/libs/session';
import type { WorkDetails } from '@/app/requests/work-page-details';
import {
  searchWorkMediaRequest,
  updateWorkMediaRequest,
  uploadWorkMediaFileRequest,
} from '@/app/requests/work-media';
import { canEditCatalog } from '@/app/utils/permissions';
import { LiteYouTube } from '../LiteYouTube';

type Kind = 'audio' | 'spotify' | 'youtube';
interface Media {
  audio: { url: string; title: string } | null;
  spotify: {
    url: string;
    title: string;
    artists: string[];
    duration: number | null;
    cover: string | null;
  } | null;
  youtube: { id: string; title: string } | null;
}

const artistsOf = (value: unknown): string[] => {
  const list = typeof value === 'string' ? safeJson(value) : value;
  return Array.isArray(list)
    ? list
        .map((a) => (typeof a === 'string' ? a : String(a?.name ?? '')))
        .filter(Boolean)
    : [];
};
function safeJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}
const minutes = (ms: number | null) =>
  ms
    ? `${Math.floor(ms / 60000)}:${String(Math.round((ms % 60000) / 1000)).padStart(2, '0')}`
    : null;

function fromWork(work: WorkDetails, uploaded: string): Media {
  const audioUrl = work.customAudioUrl || work.customAudioFile;
  return {
    audio: audioUrl
      ? { url: audioUrl, title: `${work.title} · ${uploaded}` }
      : null,
    spotify: work.spotifyTrackUrl
      ? {
          url: work.spotifyTrackUrl,
          title: work.spotifyDisplayTitle || work.title,
          artists: artistsOf(work.spotifyArtists),
          duration: work.spotifyDuration ?? null,
          cover: work.spotifyThumbnail ?? null,
        }
      : null,
    youtube: work.youtubeVideoId
      ? { id: work.youtubeVideoId, title: work.youtubeTitle || work.title }
      : null,
  };
}

/** A track id from a Spotify link, a video id from a YouTube one. */
const spotifyId = (url: string) =>
  /spotify\.com\/track\/([A-Za-z0-9]+)/.exec(url)?.[1] ?? null;
const youtubeId = (url: string) =>
  /(?:youtu\.be\/|[?&]v=)([\w-]{11})/.exec(url)?.[1] ?? null;

/**
 * "Ouvir e assistir", as in sketch A: one tab per source (an uploaded
 * recording, Spotify, YouTube), each in its own card. A work never searched
 * is searched once on arrival; curators and the work's creator can edit
 * the links and upload a recording. The video lesson lives at the end of
 * the page.
 */
export function WorkListen({ work }: { work: WorkDetails }) {
  const copy = WORK[useRouteLanguage().language].media;
  const { data: session } = useSession();
  const curator = canEditCatalog(session?.user);
  const canEdit =
    curator || (!!work.createdBy && work.createdBy === session?.user?.id);
  const [media, setMedia] = useState(() => fromWork(work, copy.uploaded));
  const [searched, setSearched] = useState(!!work.lastMediaSearch);
  const [searching, setSearching] = useState(false);
  const [editing, setEditing] = useState(false);
  const available = (['audio', 'spotify', 'youtube'] as Kind[]).filter(
    (k) => media[k]
  );
  const [kind, setKind] = useState<Kind | undefined>(available[0]);
  const current = kind && media[kind] ? kind : available[0];

  const search = async (forceRefresh: boolean) => {
    setSearching(true);
    try {
      const response = await searchWorkMediaRequest(work.id, forceRefresh);
      const data = await response.json();
      setSearched(true);
      if (!response.ok || !data.success) throw new Error();
      setMedia((m) => ({
        ...m,
        spotify: data.spotify
          ? {
              url: data.spotify.trackUrl,
              title: data.spotify.displayTitle || work.title,
              artists: data.spotify.artists ?? [],
              duration: data.spotify.duration ?? null,
              cover: data.spotify.thumbnail || data.spotify.albumArt || null,
            }
          : m.spotify,
        youtube: data.youtube
          ? { id: data.youtube.videoId, title: data.youtube.title }
          : m.youtube,
      }));
      if (forceRefresh && !data.spotify && !data.youtube) toast(copy.notFound);
    } catch {
      if (forceRefresh) toast.error(copy.searchFailed);
    } finally {
      setSearching(false);
    }
  };

  // A work nobody has searched yet is searched once, quietly.
  const tried = useRef(false);
  useEffect(() => {
    if (searched || tried.current) return;
    tried.current = true;
    void search(false);
  }, [work.id]);

  const editButton = canEdit && (
    <Button
      variante="fantasma"
      tamanho="p"
      icone={PiPencilSimple}
      onClick={() => setEditing(true)}
    >
      {copy.edit}
    </Button>
  );
  const editor = canEdit && (
    <MediaEditor
      open={editing}
      onClose={() => setEditing(false)}
      work={work}
      media={media}
      onSaved={(next) => {
        setMedia(next);
        setKind(undefined);
      }}
    />
  );

  // Searching with nothing to show yet: the shape of a player, loading.
  if (searching && !available.length) {
    return (
      <div role="status" className="flex flex-col gap-3">
        <span
          aria-hidden="true"
          className="loading-skeleton block h-[152px] rounded-card"
        />
        <span className="t-rotulo text-texto-suave">{copy.searching}</span>
      </div>
    );
  }

  if (!available.length) {
    return (
      <div
        className="flex flex-col items-start gap-3 rounded-card bg-sup-2 p-5"
        role={searching ? 'status' : undefined}
      >
        <span className="font-medium">
          {searching ? copy.searching : copy.none}
        </span>
        {!searching && (
          <span className="t-rotulo text-texto-suave">{copy.noneText}</span>
        )}
        <div className="flex flex-wrap gap-2">
          {(curator || !searched) && (
            <Button
              icone={PiMagnifyingGlass}
              carregando={searching}
              onClick={() => void search(true)}
            >
              {copy.search}
            </Button>
          )}
          {editButton}
        </div>
        {editor}
      </div>
    );
  }

  const icons = {
    audio: PiWaveform,
    spotify: PiSpotifyLogo,
    youtube: PiYoutubeLogo,
  };
  return (
    <div className="flex flex-col gap-4">
      {(available.length > 1 || canEdit) && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          {available.length > 1 ? (
            <Abas rotulo={copy.tabs.audio}>
              {available.map((k) => (
                <Aba
                  key={k}
                  ativa={current === k}
                  onClick={() => setKind(k)}
                  className="inline-flex items-center gap-2"
                >
                  <Icon de={icons[k]} tamanho="p" /> {copy.tabs[k]}
                </Aba>
              ))}
            </Abas>
          ) : (
            <span />
          )}
          {editButton}
        </div>
      )}
      {current === 'audio' && media.audio && <AudioCard audio={media.audio} />}
      {current === 'spotify' && media.spotify && (
        <div className="flex items-center gap-4 rounded-card bg-sup-2 p-3 pr-5">
          {media.spotify.cover && (
            <span className="relative h-16 w-16 shrink-0 overflow-hidden rounded-controle">
              <Image
                src={media.spotify.cover}
                alt=""
                fill
                sizes="64px"
                className="object-cover"
              />
            </span>
          )}
          <span className="flex min-w-0 flex-1 flex-col">
            <span className="truncate font-medium">{media.spotify.title}</span>
            <span className="t-rotulo truncate text-texto-suave">
              {[
                media.spotify.artists.join(', '),
                minutes(media.spotify.duration),
              ]
                .filter(Boolean)
                .join(' · ')}
            </span>
          </span>
          <a
            href={media.spotify.url}
            target="_blank"
            rel="noopener noreferrer"
            className={classesDeBotao('secundario', 'p')}
          >
            <Icon de={PiSpotifyLogo} tamanho="pp" /> {copy.openSpotify}
          </a>
        </div>
      )}
      {current === 'youtube' && media.youtube && (
        <LiteYouTube
          id={media.youtube.id}
          title={media.youtube.title}
          priority
        />
      )}
      {editor}
    </div>
  );
}

function AudioCard({ audio }: { audio: { url: string; title: string } }) {
  const copy = WORK[useRouteLanguage().language].media;
  const ref = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  return (
    <div className="flex items-center gap-4 rounded-card bg-sup-2 p-3 pr-5">
      <button
        type="button"
        onClick={() =>
          playing ? ref.current?.pause() : void ref.current?.play()
        }
        className="grid h-12 w-12 shrink-0 place-items-center rounded-full fill-ouro text-sobre-ouro"
      >
        <Icon
          de={playing ? PiPause : PiPlay}
          tamanho="m"
          rotulo={playing ? copy.pause : copy.play}
        />
      </button>
      <span className="min-w-0 flex-1 truncate font-medium">{audio.title}</span>
      <audio
        ref={ref}
        src={audio.url}
        preload="none"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
      />
    </div>
  );
}

function MediaEditor({
  open,
  onClose,
  work,
  media,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  work: WorkDetails;
  media: Media;
  onSaved: (media: Media) => void;
}) {
  const copy = WORK[useRouteLanguage().language].media;
  const [spotify, setSpotify] = useState(media.spotify?.url ?? '');
  const [youtube, setYoutube] = useState(
    media.youtube ? `https://www.youtube.com/watch?v=${media.youtube.id}` : ''
  );
  const [file, setFile] = useState<File | null>(null);
  const [removeAudio, setRemoveAudio] = useState(false);
  const [saving, setSaving] = useState(false);
  const spotifyError =
    spotify && !spotifyId(spotify) ? copy.invalidSpotify : undefined;
  const youtubeError =
    youtube && !youtubeId(youtube) ? copy.invalidYoutube : undefined;

  const save = async () => {
    if (spotifyError || youtubeError) return;
    setSaving(true);
    try {
      const data: Record<string, unknown> = { mediaSource: 'manual' };
      const sId = spotify ? spotifyId(spotify) : null;
      const yId = youtube ? youtubeId(youtube) : null;
      if (sId)
        Object.assign(data, { spotifyTrackId: sId, spotifyTrackUrl: spotify });
      if (yId)
        Object.assign(data, {
          youtubeVideoId: yId,
          youtubeVideoUrl: `https://www.youtube.com/watch?v=${yId}`,
          youtubeTitle: `${work.title} - ${work.composer.fullName}`,
        });
      if (removeAudio) data.removeCustomAudio = true;
      let audioUrl: string | null = null;
      if (file) {
        const upload = await uploadWorkMediaFileRequest(
          work.id,
          'WORK_AUDIO',
          file
        );
        const result = await upload.json();
        if (!upload.ok) throw new Error();
        audioUrl = result.url;
        Object.assign(data, {
          customAudioFile: audioUrl,
          customAudioUrl: audioUrl,
          customAudioSource: 'upload',
          customAudioMetadata: {
            title: work.title,
            source: 'upload',
            originalName: file.name,
            uploadedAt: new Date().toISOString(),
          },
        });
      }
      const response = await updateWorkMediaRequest(work.id, data);
      if (!response.ok) throw new Error();
      onSaved({
        audio:
          removeAudio && !audioUrl
            ? null
            : audioUrl
              ? { url: audioUrl, title: `${work.title} · ${copy.uploaded}` }
              : media.audio,
        spotify: sId
          ? {
              url: spotify,
              title:
                media.spotify?.url === spotify
                  ? media.spotify.title
                  : work.title,
              artists: media.spotify?.artists ?? [],
              duration: media.spotify?.duration ?? null,
              cover: media.spotify?.cover ?? null,
            }
          : media.spotify,
        youtube: yId
          ? { id: yId, title: `${work.title} - ${work.composer.fullName}` }
          : media.youtube,
      });
      toast.success(copy.saved);
      onClose();
    } catch {
      toast.error(copy.saveFailed);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Sheet
      aberto={open}
      aoFechar={onClose}
      titulo={copy.editTitle}
      largura="m"
      rodape={
        <div className="flex justify-end gap-2">
          <Button variante="fantasma" onClick={onClose}>
            {copy.cancel}
          </Button>
          <Button
            variante="primario"
            carregando={saving}
            onClick={() => void save()}
          >
            {copy.save}
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-5">
        <Field
          label={copy.spotifyUrl}
          type="url"
          inputMode="url"
          value={spotify}
          onChange={(e) => setSpotify(e.target.value)}
          erro={spotifyError}
          placeholder="https://open.spotify.com/track/…"
        />
        <Field
          label={copy.youtubeUrl}
          type="url"
          inputMode="url"
          value={youtube}
          onChange={(e) => setYoutube(e.target.value)}
          erro={youtubeError}
          placeholder="https://www.youtube.com/watch?v=…"
        />
        <Field
          label={copy.audioFile}
          ajuda={copy.audioHelp}
          type="file"
          accept="audio/mpeg,audio/ogg,audio/wav"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
        {media.audio && (
          <CaixaDeMarcar
            rotulo={copy.removeAudio}
            marcado={removeAudio}
            aoMudar={setRemoveAudio}
          />
        )}
      </div>
    </Sheet>
  );
}
