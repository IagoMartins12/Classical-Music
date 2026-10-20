import { HomeSkeleton } from '@/app/components/site/skeletons';
import { LOADING } from '@/app/conteudo/site/loading';

// The language is not known here (a loading file gets no params), so the
// screen-reader label is bilingual.
export default function Loading() {
  return <HomeSkeleton label={LOADING.home} />;
}
