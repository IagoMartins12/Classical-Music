/**
 * Mídia da obra pela API: busca automática (Spotify, YouTube, áudio
 * alternativo), gravação e limpeza dos campos, e o envio de arquivo de áudio
 * ou videoaula.
 *
 * Os componentes liam as rotas do legado como `fetch` (`ok` e `json()`);
 * `asFetchResponse` mantém esse formato.
 */
import { ApiError, apiFetch } from '@/app/libs/api/client';
import type { ApiSchema } from '@/app/libs/api/types';
import { asFetchResponse } from '@/app/requests/fetch-like';

const MEDIA_KEYS = [
  'spotifyTrackId',
  'spotifyTrackUrl',
  'spotifyDisplayTitle',
  'spotifyDuration',
  'spotifyArtists',
  'spotifyThumbnail',
  'youtubeVideoId',
  'youtubeVideoUrl',
  'youtubeTitle',
  'customAudioUrl',
  'customAudioFile',
  'customAudioSource',
  'customAudioMetadata',
  'removeCustomAudio',
  'videoAulaUrl',
  'videoAulaFile',
  'videoAulaTitle',
  'videoAulaType',
  'videoAulaSource',
  'videoAulaMetadata',
  'mediaSource',
];

export function searchWorkMediaRequest(workId: string, forceRefresh = false) {
  return asFetchResponse(
    apiFetch<ApiSchema<'MediaSearchResponseDto'>>('/media-search', {
      method: 'POST',
      body: { workId, forceRefresh },
    })
  );
}

/**
 * Grava os campos de mídia (`PATCH`; o legado usava `PUT`). A tela guarda os
 * artistas do Spotify como texto JSON; a API quer o objeto.
 */
export function updateWorkMediaRequest(
  workId: string,
  data: Record<string, unknown>
) {
  // `null` segue: é como a tela limpa um campo (o arquivo da videoaula ao
  // trocar por link). `pick` descartaria.
  const body: Record<string, unknown> = {};
  for (const key of MEDIA_KEYS) {
    if (data[key] !== undefined) {
      body[key] = data[key];
    }
  }

  if (typeof body.spotifyArtists === 'string') {
    try {
      body.spotifyArtists = JSON.parse(body.spotifyArtists);
    } catch {
      delete body.spotifyArtists;
    }
  }

  return asFetchResponse(
    apiFetch<ApiSchema<'WorkMediaResponseDto'>>(`/works/${workId}/media`, {
      method: 'PATCH',
      body,
    }),
    (result) => ({ ...result, message: 'Mídia atualizada com sucesso' })
  );
}

/**
 * Limpa um tipo de mídia. O tipo vai na query: a tela de videoaula o mandava
 * no corpo, e a rota do legado lia da query — a exclusão respondia 400.
 */
export function clearWorkMediaRequest(
  workId: string,
  type: 'spotify' | 'youtube' | 'custom-audio' | 'video-aula'
) {
  return asFetchResponse(
    apiFetch(`/works/${workId}/media`, { method: 'DELETE', query: { type } })
  );
}

/**
 * Envio de áudio ou videoaula: a API assina, o navegador envia direto ao
 * armazenamento (um vídeo grande não atravessa a API) e a API confirma. Volta
 * `{ url }`, como a rota do legado.
 */
export function uploadWorkMediaFileRequest(
  workId: string,
  kind: 'WORK_AUDIO' | 'WORK_VIDEO_LESSON',
  file: File
) {
  return asFetchResponse(
    (async () => {
      const signed = await apiFetch<ApiSchema<'SignedUploadResponseDto'>>(
        '/uploads/signed',
        { method: 'POST', body: { kind, scopeId: workId } }
      );

      const form = new FormData();
      for (const [key, value] of Object.entries(signed.fields)) {
        form.append(key, String(value));
      }
      form.append('file', file);

      const upload = await fetch(signed.uploadUrl, {
        method: 'POST',
        body: form,
      });

      if (!upload.ok) {
        throw new ApiError(
          upload.status,
          'Não foi possível enviar o arquivo',
          null
        );
      }

      const asset = await apiFetch<{ url: string | null }>(
        `/uploads/${signed.assetId}/confirm`,
        { method: 'POST' }
      );

      return { url: asset.url ?? '' };
    })()
  );
}
