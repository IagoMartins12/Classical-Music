/**
 * Conquistas pela API, chamadas do navegador.
 *
 * A lista da API separa as desbloqueadas das que faltam; a tela lia só as
 * desbloqueadas, com as estatísticas contadas sobre elas — a conta é a mesma
 * do legado, feita aqui.
 */
import { apiFetch } from '@/app/libs/api/client';
import type { ApiSchema } from '@/app/libs/api/types';

type UnlockedAchievement = ApiSchema<'UnlockedAchievementDto'>;

const RARITIES = ['COMMON', 'RARE', 'EPIC', 'LEGENDARY'] as const;

export async function listAchievements<T = UnlockedAchievement>(
  category?: string
) {
  const data =
    await apiFetch<ApiSchema<'AchievementListResponseDto'>>('/achievements');
  const achievements = category
    ? data.unlocked.filter((achievement) => achievement.category === category)
    : data.unlocked;

  const byCategory: Record<string, number> = {};
  for (const achievement of achievements) {
    byCategory[achievement.category] =
      (byCategory[achievement.category] ?? 0) + 1;
  }

  return {
    success: true,
    achievements: achievements as unknown as T[],
    stats: {
      total: achievements.length,
      newCount: achievements.filter((achievement) => achievement.isNew).length,
      totalXP: achievements.reduce((sum, a) => sum + a.xpReward, 0),
      byRarity: Object.fromEntries(
        RARITIES.map((rarity) => [
          rarity,
          achievements.filter((achievement) => achievement.rarity === rarity)
            .length,
        ])
      ),
      byCategory,
    },
  };
}

/**
 * O servidor avalia todas as categorias (o legado deixava o navegador dizer o
 * que conceder); a tela mostra o aviso só das conquistas da categoria pedida,
 * como antes.
 */
export async function checkAchievements(category?: string) {
  const data = await apiFetch<ApiSchema<'CheckAchievementsResponseDto'>>(
    '/achievements/check',
    { method: 'POST' }
  );

  return {
    success: true,
    newAchievements: category
      ? data.unlocked.filter((achievement) => achievement.category === category)
      : data.unlocked,
  };
}

export function markAchievementViewed(badgeId: string) {
  return apiFetch<void>(`/achievements/${encodeURIComponent(badgeId)}/viewed`, {
    method: 'POST',
  });
}
