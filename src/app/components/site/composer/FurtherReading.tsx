import { PiArrowRight, PiArticle } from 'react-icons/pi';
import Link from '@/app/components/LocalizedLink';
import Image from '@/app/components/SmartImage';
import { Icon } from '@/app/components/ui/Icon';
import type { ComposerCopy } from '@/app/conteudo/site/composer';
import type { BlogArticlePreview } from '@/app/requests/blog/composer-articles';

/** "Para ler": the blog articles that mention the composer. */
export function FurtherReading({
  articles,
  copy,
}: {
  articles: BlogArticlePreview[];
  copy: ComposerCopy['reading'];
}) {
  if (!articles.length) return null;
  return (
    <section className="mt-20 flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
        <h2 className="t-titulo max-sm:!text-[1.75rem]">{copy.title}</h2>
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 t-rotulo text-ouro-texto underline decoration-transparent underline-offset-4 hover:decoration-[var(--ouro)]"
        >
          {copy.blog} <Icon de={PiArrowRight} tamanho="pp" />
        </Link>
      </div>
      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {articles.map((article) => (
          <li key={article.id}>
            <Link
              href={`/blog/${article.slug}`}
              className="group flex h-full items-center gap-4 rounded-card bg-sup-2 p-3 pr-4"
            >
              <span className="relative grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-controle bg-[var(--fundo)]">
                {article.coverImage ? (
                  <Image
                    src={article.coverImage}
                    alt=""
                    fill
                    sizes="64px"
                    className="object-cover object-top"
                  />
                ) : (
                  <Icon
                    de={PiArticle}
                    tamanho="m"
                    className="text-texto-fraco"
                  />
                )}
              </span>
              <span className="flex min-w-0 flex-col">
                <span className="line-clamp-2 font-display text-[1.125rem] leading-snug group-hover:text-ouro-texto">
                  {article.title}
                </span>
                <span className="t-legenda">
                  {[
                    article.authorName,
                    article.readTime && `${article.readTime} min`,
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
