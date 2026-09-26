import { notFound } from 'next/navigation';
import { GuiaClient } from './GuiaClient';

/**
 * A página que mostra o sistema de design funcionando.
 *
 * **Só em desenvolvimento.** Em produção ela responde 404: é ferramenta de
 * quem constrói, não conteúdo do produto, e uma rota a mais no site publicado
 * seria mais uma coisa para o Google indexar e para alguém manter.
 *
 * Serve para validar a fase 1 (tokens e tipografia) e a fase 2 (primitivos)
 * sem precisar caçar as telas onde cada componente aparece.
 */
export default function StyleguidePage() {
  if (process.env.NODE_ENV === 'production') {
    notFound();
  }

  return <GuiaClient />;
}
