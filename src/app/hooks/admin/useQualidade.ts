'use client';

import { getQualidade } from '@/app/requests/admin/qualidade';
import { adminKeys, useAdminQuery } from './query';

/** O quadro de qualidade; a API o guarda por dez minutos. */
export const useQualidade = () =>
  useAdminQuery(adminKeys.list('qualidade', {}), getQualidade);
