// app/actions/genre-actions.ts
'use server';

import { searchWorkGenres } from '@/app/requests/work-details';

export async function searchGenresAction(
  searchTerm: string = '',
  limit: number = 20
) {
  try {
    const genres = await searchWorkGenres(searchTerm, limit);
    return {
      success: true,
      data: genres,
      count: genres.length,
    };
  } catch (error) {
    console.error('Erro na busca de gêneros:', error);
    return {
      success: false,
      error: 'Erro interno do servidor',
      data: [],
      count: 0,
    };
  }
}
