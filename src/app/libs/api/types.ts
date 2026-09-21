/**
 * Tipos do contrato da API, gerados do OpenAPI dela.
 *
 * `schema.d.ts` não se edita à mão: com a API de pé, `npm run api:types`
 * o refaz a partir de `/api/docs-json` (`API_DOCS_URL` troca o endereço).
 * Quando a API muda um DTO, o `tsc` do front aponta quem precisa acompanhar.
 */
import type { components } from './schema';

type Schemas = components['schemas'];

/** Um DTO da API pelo nome — ex.: `ApiSchema<'ComposerListItemDto'>`. */
export type ApiSchema<Name extends keyof Schemas> = Schemas[Name];
