// app/requests/learning.ts — o que o usuário logado estuda, pela API (Etapa 3)
import { apiFetch } from '@/app/libs/api/client';
import { getServerAccessToken } from '@/app/libs/api/server-session';
import type { LearnedItem, WantToLearnItem } from '../stores/useLearningStore';

interface LearningData {
  wantToLearn: WantToLearnItem[];
  learned: LearnedItem[];
  totalWantToLearn: number;
  totalLearned: number;
}

const EMPTY_LEARNING_DATA: LearningData = {
  wantToLearn: [],
  learned: [],
  totalWantToLearn: 0,
  totalLearned: 0,
};

/**
 * "Quero aprender" e "já aprendi" de quem está logado, para a renderização no
 * servidor. Dado de uma pessoa só: sem cache (`no-store`), com o token do
 * cookie repassado à API. A API devolve na ordem do legado (prioridade e data;
 * domínio e data), com a obra e a partitura escolhida. Sem sessão, ou se a API
 * falhar, as listas vêm vazias, como no legado.
 */
export async function getCurrentUserLearningData(): Promise<LearningData> {
  const token = await getServerAccessToken();

  if (!token) {
    return EMPTY_LEARNING_DATA;
  }

  try {
    const [wantToLearn, learned] = await Promise.all([
      apiFetch<{ items: WantToLearnItem[]; count: number }>(
        '/learning/want-to-learn',
        { token, cache: 'no-store' }
      ),
      apiFetch<{ items: LearnedItem[]; count: number }>('/learning/learned', {
        token,
        cache: 'no-store',
      }),
    ]);

    return {
      wantToLearn: wantToLearn.items,
      learned: learned.items,
      totalWantToLearn: wantToLearn.count,
      totalLearned: learned.count,
    };
  } catch (error) {
    console.error(
      'Erro ao buscar dados de aprendizado do usuário atual:',
      error
    );
    return EMPTY_LEARNING_DATA;
  }
}
