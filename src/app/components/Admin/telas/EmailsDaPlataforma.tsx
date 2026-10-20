'use client';

import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { PiEye } from 'react-icons/pi';
import { PreviaDeEmail } from '@/app/components/Admin/Newsletter/PreviaDeEmail';
import { Cabecalho } from '@/app/components/Admin/painel/Cabecalho';
import { Erro } from '@/app/components/ui/Estados';
import { Icon } from '@/app/components/ui/Icon';
import { Stack } from '@/app/components/ui/Layout';
import { Row } from '@/app/components/ui/Row';
import { Text } from '@/app/components/ui/Text';
import {
  getEmailsDaPlataforma,
  type EmailDaPlataforma,
} from '@/app/requests/admin/newsletterPainel';

const GRUPOS: { id: EmailDaPlataforma['group']; titulo: string }[] = [
  { id: 'conta', titulo: 'Conta e segurança' },
  { id: 'portal', titulo: 'Portal do professor' },
  { id: 'cobranca', titulo: 'Cobrança' },
  { id: 'contato', titulo: 'Contato' },
  { id: 'newsletter', titulo: 'Newsletter' },
];

/**
 * Os e-mails que a plataforma manda sozinha, como saem, com dados de
 * exemplo, em português e inglês. Só leitura: o texto mora na API
 * (`src/mail/templates`), um arquivo por grupo.
 */
export default function EmailsDaPlataforma() {
  const lista = useQuery({
    queryKey: ['admin', 'mail', 'amostras'],
    queryFn: getEmailsDaPlataforma,
    staleTime: Infinity,
  });
  const [vendo, setVendo] = useState<EmailDaPlataforma | null>(null);

  return (
    <Stack gap={8}>
      <Cabecalho
        titulo="E-mails da plataforma"
        descricao="Confirmar conta, nova senha, convite, pagamento… Cada um como chega na caixa de entrada, com dados de exemplo."
      />

      {lista.isError ? (
        <Erro titulo="Não foi possível carregar os e-mails" />
      ) : (
        GRUPOS.map((grupo) => {
          const itens = lista.data?.filter((e) => e.group === grupo.id);
          return (
            <section key={grupo.id} className="flex flex-col gap-2">
              <Text papel="subtitulo" as="h2">
                {grupo.titulo}
              </Text>
              {!itens ? (
                <Row.Skeleton repetir={3} />
              ) : (
                <ul className="flex flex-col">
                  {itens.map((email) => (
                    <Row
                      key={email.id}
                      as="li"
                      clicavel
                      onClick={() => setVendo(email)}
                      titulo={email.name}
                      depois={
                        <Icon
                          de={PiEye}
                          tamanho="p"
                          rotulo={`Ver ${email.name}`}
                          className="text-texto-fraco"
                        />
                      }
                    />
                  ))}
                </ul>
              )}
            </section>
          );
        })
      )}

      {vendo && (
        <PreviaDeEmail
          aberto
          aoFechar={() => setVendo(null)}
          titulo={vendo.name}
          sistema={vendo.id}
        />
      )}
    </Stack>
  );
}
