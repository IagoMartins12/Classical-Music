import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { InstrumentPage } from '@/app/components/site/instruments/InstrumentPage';
import {
  INSTRUMENTS,
  instrumentChapter,
  instrumentMeta,
} from '@/app/conteudo/instruments';
import { imageCredit } from '@/app/conteudo/instruments/credits';
import { LEARN } from '@/app/conteudo/site/learn';
import { JsonLd } from '@/app/components/site/JsonLd';
import { capituloJsonLd } from '@/app/utils/seo';
import { alternatesFor } from '@/app/utils/seoAlternates';
import {
  routeLanguage,
  type LangParams,
} from '@/app/utils/translations/routeLanguage';

type InstrumentParams = LangParams<{ instrument: string }>;

export const revalidate = 3600;

export async function generateStaticParams() {
  return INSTRUMENTS.map((meta) => ({ instrument: meta.key }));
}

export async function generateMetadata({
  params,
}: {
  params: InstrumentParams;
}): Promise<Metadata> {
  const language = await routeLanguage(params);
  const meta = instrumentMeta((await params).instrument);
  const chapter = meta && instrumentChapter(meta.key, language);
  if (!meta || !chapter) return {};
  return {
    title: LEARN[language].instruments.metaTitle(chapter.name),
    description: chapter.lede,
    alternates: alternatesFor(`/instruments/${meta.key}`, language),
    openGraph: { images: [meta.photo] },
  };
}

export default async function InstrumentRoute({
  params,
}: {
  params: InstrumentParams;
}) {
  const language = await routeLanguage(params);
  const meta = instrumentMeta((await params).instrument);
  if (!meta) notFound();
  const chapter = instrumentChapter(meta.key, language);
  return (
    <>
      {chapter && (
        <JsonLd
          data={capituloJsonLd({
            caminho: `/instruments/${meta.key}`,
            titulo: LEARN[language].instruments.metaTitle(chapter.name),
            descricao: chapter.lede,
            imagem: meta.photo,
            assunto: chapter.name,
            secao: [
              language === 'pt' ? 'Instrumentos' : 'Instruments',
              '/instruments',
            ],
            language,
          })}
        />
      )}
      <InstrumentPage
        meta={meta}
        language={language}
        credit={imageCredit(meta.key, language)}
      />
    </>
  );
}
