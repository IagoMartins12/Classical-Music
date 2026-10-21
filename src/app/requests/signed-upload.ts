// app/requests/signed-upload.ts — o envio direto ao armazenamento
//
// A API assina (`POST /uploads/signed`), o navegador envia o arquivo ao
// Cloudinary e a API confirma (`POST /uploads/:id/confirm`). Os três envios do
// site (vídeo de performance, áudio da obra, videoaula) passam por aqui.
//
// Antes cada um fazia o POST ao Cloudinary por conta própria e, se falhasse,
// mostrava "Não foi possível enviar" sem dizer por quê — arquivo grande demais,
// formato que o provedor não aceita e rede caída pareciam o mesmo erro.
import { ApiError } from '@/app/libs/api/client';
import { porIdioma } from '@/app/utils/porIdioma';

export interface SignedUpload {
  assetId: string;
  uploadUrl: string;
  fields: Record<string, unknown>;
  maxBytes?: number;
  allowedMimeTypes?: string[];
}

const mb = (bytes: number) => `${Math.round(bytes / 1024 / 1024)} MB`;

/** O que o provedor respondeu, em uma frase; vazio se não deu para ler. */
async function providerMessage(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as { error?: { message?: string } };
    return body.error?.message ?? '';
  } catch {
    return '';
  }
}

export async function sendSignedFile(signed: SignedUpload, file: File) {
  // O que a API já sabe recusar, recusa-se antes de gastar a banda.
  if (signed.maxBytes && file.size > signed.maxBytes) {
    throw new ApiError(
      413,
      porIdioma(
        `O arquivo tem ${mb(file.size)} e o limite é ${mb(signed.maxBytes)}.`,
        `The file is ${mb(file.size)} and the limit is ${mb(signed.maxBytes)}.`
      ),
      null
    );
  }
  if (
    signed.allowedMimeTypes?.length &&
    file.type &&
    !signed.allowedMimeTypes.includes(file.type)
  ) {
    throw new ApiError(
      415,
      porIdioma(
        `Formato não aceito (${file.type}). Aceitos: ${signed.allowedMimeTypes.join(', ')}.`,
        `Format not accepted (${file.type}). Accepted: ${signed.allowedMimeTypes.join(', ')}.`
      ),
      null
    );
  }

  const form = new FormData();
  for (const [key, value] of Object.entries(signed.fields)) {
    form.append(key, String(value));
  }
  form.append('file', file);

  let upload: Response;
  try {
    upload = await fetch(signed.uploadUrl, { method: 'POST', body: form });
  } catch {
    throw new ApiError(
      0,
      porIdioma(
        'A conexão caiu durante o envio. Tente de novo com a rede estável.',
        'The connection dropped during the upload. Try again on a stable network.'
      ),
      null
    );
  }

  if (!upload.ok) {
    const reason = await providerMessage(upload);
    throw new ApiError(
      upload.status,
      reason
        ? porIdioma(
            `Não foi possível enviar o arquivo: ${reason}`,
            `Could not send the file: ${reason}`
          )
        : porIdioma(
            'Não foi possível enviar o arquivo',
            'Could not send the file'
          ),
      null
    );
  }
}
