// app/api/revalidate/route.ts
import { createHash, timingSafeEqual } from 'node:crypto';
import { revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

const TAG_PATTERN = /^[a-z0-9:-]{1,64}$/;
const MAX_TAGS = 50;

/**
 * A API avisa aqui quando um dado muda (Etapa 1.7): `POST` com as tags
 * afetadas, assinado com `FRONT_REVALIDATE_SECRET` no cabeçalho
 * `x-revalidate-secret`. Cada tag é a mesma do `next: { tags }` das leituras
 * (`composers`, `epochs`, `works`, `blog-articles`…).
 *
 * Substitui a rota antiga, que deixava qualquer conta logada esvaziar o cache
 * de qualquer caminho (`revalidatePath`): quem limpa o cache agora é só a API.
 */
export async function POST(request: NextRequest) {
  const secret = process.env.FRONT_REVALIDATE_SECRET;

  if (
    !secret ||
    !sameSecret(request.headers.get('x-revalidate-secret'), secret)
  ) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const tags = parseTags(await request.json().catch(() => null));

  if (!tags) {
    return NextResponse.json(
      { error: '`tags` precisa ser uma lista de tags válidas' },
      { status: 400 }
    );
  }

  for (const tag of tags) {
    revalidateTag(tag);
  }

  return NextResponse.json({ revalidated: tags });
}

/** Compara pelo hash: tempo constante e sem vazar o tamanho do segredo. */
function sameSecret(received: string | null, expected: string): boolean {
  if (!received) {
    return false;
  }

  const digest = (value: string) => createHash('sha256').update(value).digest();
  return timingSafeEqual(digest(received), digest(expected));
}

function parseTags(body: unknown): string[] | null {
  if (!body || typeof body !== 'object' || !('tags' in body)) {
    return null;
  }

  const { tags } = body as { tags: unknown };

  if (
    !Array.isArray(tags) ||
    tags.length === 0 ||
    tags.length > MAX_TAGS ||
    !tags.every((tag) => typeof tag === 'string' && TAG_PATTERN.test(tag))
  ) {
    return null;
  }

  return tags as string[];
}
