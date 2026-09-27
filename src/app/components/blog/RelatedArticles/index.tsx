import { ArticleCard } from '../ArticleCard';
import { Stack } from '@/app/components/ui/Layout';

interface RelatedArticlesProps {
  articles: any[];
}

export function RelatedArticles({ articles }: RelatedArticlesProps) {
  if (articles.length === 0) return null;

  return (
    <Stack gap={8}>
      <h2 className="text-3xl font-bold text-theme-primary">
        Artigos Relacionados
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {articles.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>
    </Stack>
  );
}
