import axios from 'axios';
import { GenreType } from '@/app/types/genre';
import { PeriodType } from '@/app/types/period';

const BASE_URL = 'https://api.openopus.org';

// ----------------------------
// COMPOSERS
// ----------------------------
export async function getComposer(termo: string) {
  const response = await axios.get(
    `${BASE_URL}/composer/list/search/${termo}.json`
  );
  return response.data.composers;
}

export async function getComposerImslp(start: string = '0') {
  const response = await axios.get(
    `https://imslp.org/imslpscripts/API.ISCR.php?account=worklist/disclaimer=accepted/sort=id/type=1/start=${start}/retformat=json`
  );
  return response.data;
}

export async function getPopularComposers() {
  const response = await axios.get(`${BASE_URL}/composer/list/pop.json`);
  return response.data.composers;
}

export async function getEssentialComposers() {
  const response = await axios.get(`${BASE_URL}/composer/list/rec.json`);
  return response.data.composers;
}

export async function getComposersByPeriod(period: PeriodType) {
  const response = await axios.get(
    `${BASE_URL}/composer/list/epoch/${period}.json`
  );
  return response.data.composers;
}

// ----------------------------
// GENRES
// ----------------------------

export async function getGenresByComposerId(composerId: string) {
  const response = await axios.get(
    `${BASE_URL}/genre/list/composer/${composerId}.json`
  );
  return response.data;
}

// ----------------------------
// WORKS
// ----------------------------

export async function getWorks(composerId: number) {
  const response = await axios.get(
    `${BASE_URL}/work/list/composer/${composerId}/genre/all.json`
  );
  return response.data;
}

export async function getPopularPieces(composerId: number) {
  const response = await axios.get(
    `${BASE_URL}/work/list/composer/${composerId}/genre/Popular.json`
  );
  return response.data;
}

export async function getEssentialPieces(composerId: number) {
  const response = await axios.get(
    `${BASE_URL}/work/list/composer/${composerId}/genre/Recommended.json`
  );
  return response.data;
}

export async function getWorksByComposerAndGenre(
  composerId: number,
  genre: GenreType
) {
  const response = await axios.get(
    `${BASE_URL}/work/list/composer/${composerId}/${genre}.json`
  );
  return response.data;
}

export async function getWorksByComposerAndTitle(
  composerId: number,
  title: string
) {
  const response = await axios.get(
    `${BASE_URL}/work/list/composer/${composerId}/all/search/${title}.json`
  );
  return response.data;
}

export async function getWorksByComposerAndTitleAndGenre(
  composerId: number,
  genre: GenreType,
  title: string
) {
  const response = await axios.get(
    `${BASE_URL}/work/list/composer/${composerId}/genre/${genre}/search/${title}.json`
  );
  return response.data;
}

export async function getWorksDetail(workId: string) {
  const response = await axios.get(`${BASE_URL}/work/detail/${workId}.json`);
  return response.data;
}

export async function getMultipleWorksDetail(workId: string) {
  const response = await axios.get(`${BASE_URL}/work/list/ids/${workId}.json`);
  return response.data;
}

// ----------------------------
// RANDOM WORKS
// ----------------------------

export async function getRandomWorksFromAPI(options: RandomWorkOptions = {}) {
  try {
    const response = await axios.post(`${BASE_URL}/dyn/work/random`, null, {
      headers: {
        ...options,
      },
    });

    return response.data;
  } catch (error) {
    console.error('Erro ao buscar obras aleatórias:', error);
    throw error;
  }
}
