'use client';

import { Stack } from '@/app/components/ui/Layout';
import { Row } from '@/app/components/ui/Row';
import { Sheet } from '@/app/components/ui/Sheet';
import { Text } from '@/app/components/ui/Text';
import { Elo, useNavegar } from '@/app/components/Admin/painel/Navegador';
import { dataCurta, dataHora } from '@/app/components/Admin/painel/formatos';
import { adminKeys, useAdminQuery } from '@/app/hooks/admin/query';
import {
  NOME_DA_SITUACAO,
  getTarefaDoPortal,
} from '@/app/requests/admin/portal';
import { Bloco, Info, Lista } from './FichaAula';

/**
 * A ficha de uma tarefa do portal: o que foi pedido, até quando, de qual aula
 * saiu, o que o aluno fez e o retorno do professor. Só leitura.
 */
export function FichaTarefa({
  tarefaId,
  aoFechar,
}: {
  tarefaId: string;
  aoFechar: () => void;
}) {
  const navegar = useNavegar();
  const q = useAdminQuery(adminKeys.list('portal', { tarefa: tarefaId }), () =>
    getTarefaDoPortal(tarefaId)
  );
  const t = q.data;
  const atrasada =
    t && !t.isCompleted && t.dueDate && new Date(t.dueDate) < new Date();

  return (
    <Sheet
      aberto
      aoFechar={aoFechar}
      titulo={t?.title ?? 'Tarefa'}
      descricao={
        t
          ? `${atrasada ? 'Atrasada' : (NOME_DA_SITUACAO[t.status] ?? t.status)}${t.dueDate ? ` · prazo ${dataCurta(t.dueDate)}` : ''}`
          : undefined
      }
      largura="m"
    >
      {!t ? (
        q.error ? (
          <Text papel="rotulo" tom="erro" as="p">
            {q.error}
          </Text>
        ) : (
          <Row.Skeleton repetir={6} />
        )
      ) : (
        <Stack gap={6}>
          <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
            <Info rotulo="Aluno">
              {t.aluno.userId ? (
                <Elo onClick={() => navegar.usuario(t.aluno.userId!)}>
                  {t.aluno.nome}
                </Elo>
              ) : (
                '—'
              )}
            </Info>
            <Info rotulo="Professor">
              {t.professor.userId ? (
                <Elo onClick={() => navegar.usuario(t.professor.userId!)}>
                  {t.professor.nome}
                </Elo>
              ) : (
                '—'
              )}
            </Info>
            <Info rotulo="Da aula">
              <Elo onClick={() => navegar.aula(t.aula.id)}>{t.aula.titulo}</Elo>{' '}
              <span className="t-legenda">({dataCurta(t.aula.quando)})</span>
            </Info>
            <Info rotulo="Tipo e prioridade">
              {t.type} · {t.priority}
            </Info>
            <Info rotulo="Progresso">
              {t.progress !== null ? `${Math.round(t.progress)}%` : '—'}
              {t.completedAt ? ` · entregue ${dataHora(t.completedAt)}` : ''}
            </Info>
            <Info rotulo="Tempo">
              {t.estimatedTime ? `${t.estimatedTime} min previstos` : '—'}
              {t.actualTime ? ` · ${t.actualTime} min feitos` : ''}
            </Info>
            <Info rotulo="Nota do professor">
              {t.teacherRating !== null ? `${t.teacherRating}/5` : '—'}
            </Info>
            <Info rotulo="Criada em">{dataHora(t.createdAt)}</Info>
          </dl>

          {t.description && (
            <Bloco titulo="O que foi pedido">{t.description}</Bloco>
          )}
          <Lista titulo="Exercícios" itens={t.exercises} />
          <Lista titulo="Metas de prática" itens={t.practiceGoals} />
          <Lista titulo="Metas técnicas" itens={t.technicalGoals} />
          <Lista titulo="Metas musicais" itens={t.musicalGoals} />
          {t.studentNotes && (
            <Bloco titulo="Notas do aluno">{t.studentNotes}</Bloco>
          )}
          {t.teacherFeedback && (
            <Bloco titulo="Retorno do professor">{t.teacherFeedback}</Bloco>
          )}
        </Stack>
      )}
    </Sheet>
  );
}
