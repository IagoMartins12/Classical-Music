/**
 * Os primitivos do sistema de design (Etapa 7.8, fase 2).
 *
 * Saíram das combinações de classe que o front já repetia: `h-4 w-4` em 768
 * lugares, `flex items-center space-x-2|3` em 734, `classical-card p-6` em 259,
 * o rótulo de campo em 222. Juntos, cobrem **3.967 repetições**.
 *
 * Nesta fase eles apenas passam a existir: nenhuma tela do produto foi
 * trocada ainda. A substituição é a fase 3, por codemod, um padrão por vez.
 *
 * Ver `/styleguide` para a página que mostra todos, nos dois temas.
 */

export { cx } from './cx';
export { Text } from './Text';
export { Stack, Inline, Container } from './Layout';
export { Icon } from './Icon';
export { Skeleton, AreaCarregando } from './Skeleton';
export { Card } from './Card';
export { Button } from './Button';
export { Field } from './Field';
export { Badge, Chip } from './Badge';
export { Row } from './Row';
export { Sheet } from './Sheet';
export { Vazio, Erro } from './Estados';
