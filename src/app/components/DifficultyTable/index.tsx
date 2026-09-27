'use client';

import Link from 'next/link';
import {
  PiArrowSquareOut,
  PiDownloadSimple,
  PiMedal,
  PiMusicNotes,
  PiUser,
} from 'react-icons/pi';
import { DifficultyWork } from '@/app/requests/difficulty-details'; // ✅ Import atualizado
import { AnimatedItem } from '../animation/AnimatedComponents';
import { Inline, Stack } from '@/app/components/ui/Layout';
import { Text } from '@/app/components/ui/Text';
import { Card } from '@/app/components/ui/Card';

interface DifficultyTableProps {
  works: DifficultyWork[]; // ✅ Tipo atualizado
  selectedSystem: string;
  isPending: boolean;
}

export default function DifficultyTable({
  works,
  selectedSystem,
  isPending,
}: DifficultyTableProps) {
  if (works.length === 0) {
    return (
      <div className="classical-card p-12 text-center">
        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
          <PiMusicNotes className="w-8 h-8 text-theme-tertiary" />
        </div>
        <h3 className="text-xl font-bold text-theme-primary mb-2 classical-title">
          Nenhuma obra encontrada
        </h3>
        <p className="text-theme-secondary">
          Tente ajustar seus filtros para encontrar obras com dificuldade
          classificada.
        </p>
      </div>
    );
  }

  const getDifficultyDisplay = (work: DifficultyWork) => {
    // ✅ SISTEMA HÍBRIDO DE EXIBIÇÃO
    const enumColors = {
      BEGINNER: 'text-green-500 bg-green-500/10 border-green-500/30',
      INTERMEDIATE: 'text-blue-500 bg-blue-500/10 border-blue-500/30',
      ADVANCED: 'text-purple-500 bg-purple-500/10 border-purple-500/30',
    };

    const enumIcons = {
      BEGINNER: '🌱',
      INTERMEDIATE: '🎓',
      ADVANCED: '🏆',
    };

    const enumColor = enumColors[work.difficultyLevel];
    const enumIcon = enumIcons[work.difficultyLevel];

    return { enumColor, enumIcon };
  };

  return (
    <div className="classical-card overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-theme-secondary">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mr-3">
              <PiMedal className="w-5 h-5 text-theme-primary" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-theme-primary classical-title">
                Obras por Dificuldade
              </h3>
              <Text papel="rotulo" tom="suave" as="p">
                {works.length} obra{works.length !== 1 ? 's' : ''} encontrada
                {works.length !== 1 ? 's' : ''} · Sistema {selectedSystem}
              </Text>
            </div>
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-theme-elevated border-b border-theme-secondary">
            <tr>
              <th className="text-left py-4 px-6 text-sm font-semibold text-theme-primary">
                Nível
              </th>
              <th className="text-left py-4 px-6 text-sm font-semibold text-theme-primary">
                Obra
              </th>
              <th className="text-left py-4 px-6 text-sm font-semibold text-theme-primary">
                Compositor
              </th>
              <th className="text-left py-4 px-6 text-sm font-semibold text-theme-primary">
                Instrumento
              </th>
              <th className="text-left py-4 px-6 text-sm font-semibold text-theme-primary">
                Partituras
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-linha">
            {works.map((work, index) => (
              <AnimatedItem
                key={work.id}
                direction="left"
                hover="lift"
                component="tr"
                className="group transition-all duration-300"
                style={{
                  animationDelay: `${index * 0.05}s`,
                  animationFillMode: 'backwards',
                }}
              >
                {/* Nível - SISTEMA HÍBRIDO */}
                <td className="py-4 px-6">
                  <Stack gap={2}>
                    {/* Badge Principal (Enum) */}
                    <div
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold max-w-fit bg-sup-2 ${
                        getDifficultyDisplay(work).enumColor
                      }`}
                    >
                      <span className="mr-1">
                        {getDifficultyDisplay(work).enumIcon}
                      </span>
                      {work.difficultyLevel}
                    </div>

                    {/* Badge Detalhado (IMSLP) - Se disponível */}
                    {work.imslpDifficultyLevel && (
                      <div className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border-2 border-dashed border-gray-300 text-gray-600 bg-gray-50 max-w-fit">
                        <PiMedal className="w-3 h-3 mr-1" />
                        {work.imslpDifficultySystem || 'IMSLP'}{' '}
                        {work.imslpDifficultyLevel}
                      </div>
                    )}
                  </Stack>
                </td>

                {/* Obra */}
                <td className="py-4 px-6">
                  <div>
                    <Link
                      href={`/works/${work.id}`}
                      className="font-semibold text-theme-primary transition-colors line-clamp-2"
                    >
                      {work.title}
                    </Link>
                    {work.subtitle && (
                      <Text
                        papel="rotulo"
                        tom="fraco"
                        as="p"
                        className="mt-1 line-clamp-1"
                      >
                        {work.subtitle}
                      </Text>
                    )}
                    {work.opOrCatalog && (
                      <Text papel="legenda" tom="fraco" as="p" className="mt-1">
                        {work.opOrCatalog}
                      </Text>
                    )}
                  </div>
                </td>

                {/* Compositor */}
                <td className="py-4 px-6">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center mr-2">
                      <PiUser className="w-3 h-3 text-theme-primary" />
                    </div>
                    <div>
                      <Link
                        href={`/composer/${work.composer.id}`}
                        className="font-medium text-theme-primary transition-colors text-sm"
                      >
                        {work.composer.fullName || work.composer.name}
                      </Link>
                      {work.compositionYear && (
                        <Text papel="legenda" tom="fraco" as="p">
                          {work.compositionYear}
                        </Text>
                      )}
                    </div>
                  </div>
                </td>

                {/* Instrumento */}
                <td className="py-4 px-6">
                  <div className="flex items-center">
                    <PiMusicNotes className="w-4 h-4 text-ouro-texto mr-2" />
                    <Text papel="rotulo" tom="suave" className="font-medium">
                      {work.instrument.name}
                    </Text>
                  </div>
                </td>

                {/* Partituras */}
                <td className="py-4 px-6">
                  <Inline gap={2}>
                    {work.workScores && work.workScores.length > 0 ? (
                      <>
                        {work.workScores.slice(0, 2).map((score) => (
                          <Link
                            key={score.id}
                            href={score.downloadUrl || work.imslpPermlink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-2 py-1 rounded text-xs font-medium transition-all duration-300 bg-sup-2"
                          >
                            <PiDownloadSimple className="w-3 h-3 mr-1" />
                            {score.fileFormat}
                          </Link>
                        ))}
                        {work.workScores.length > 2 && (
                          <Text papel="legenda" tom="fraco">
                            +{work.workScores.length - 2} mais
                          </Text>
                        )}
                      </>
                    ) : (
                      <Link
                        href={work.imslpPermlink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-2 py-1 text-ouro-texto rounded text-xs font-medium transition-all duration-300 bg-sup-2"
                      >
                        <PiArrowSquareOut className="w-3 h-3 mr-1" />
                        IMSLP
                      </Link>
                    )}
                  </Inline>
                </td>
              </AnimatedItem>
            ))}
          </tbody>
        </table>
      </div>

      {isPending && (
        <div className="absolute inset-0 backdrop-blur-sm flex items-center justify-center">
          <Card className="text-center">
            <div className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <Text papel="rotulo" tom="forte" as="p" className="font-medium">
              Carregando...
            </Text>
          </Card>
        </div>
      )}
    </div>
  );
}
