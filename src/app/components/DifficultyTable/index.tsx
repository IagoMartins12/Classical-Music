'use client';

import Link from 'next/link';
import {
  FiExternalLink,
  FiDownload,
  FiUser,
  FiMusic,
  FiAward,
} from 'react-icons/fi';
import { DifficultyWork } from '@/app/requests/difficulty-details'; // ✅ Import atualizado
import { AnimatedItem } from '../animation/AnimatedComponents';

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
        <div className="w-16 h-16 bg-theme-tertiary/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <FiMusic className="w-8 h-8 text-theme-tertiary" />
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
            <div className="w-10 h-10 bg-gradient-to-br from-brand-primary to-accent-green rounded-xl flex items-center justify-center mr-3">
              <FiAward className="w-5 h-5 text-theme-primary" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-theme-primary classical-title">
                Obras por Dificuldade
              </h3>
              <p className="text-theme-secondary text-sm">
                {works.length} obra{works.length !== 1 ? 's' : ''} encontrada
                {works.length !== 1 ? 's' : ''} · Sistema {selectedSystem}
              </p>
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
          <tbody className="divide-y divide-theme-secondary">
            {works.map((work, index) => (
              <AnimatedItem
                key={work.id}
                direction="left"
                hover="lift"
                component="tr"
                className="group hover:bg-interactive-hover transition-all duration-300"
                style={{
                  animationDelay: `${index * 0.05}s`,
                  animationFillMode: 'backwards',
                }}
              >
                {/* Nível - SISTEMA HÍBRIDO */}
                <td className="py-4 px-6">
                  <div className="flex flex-col space-y-2">
                    {/* Badge Principal (Enum) */}
                    <div
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold border max-w-fit ${
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
                        <FiAward className="w-3 h-3 mr-1" />
                        {work.imslpDifficultySystem || 'IMSLP'}{' '}
                        {work.imslpDifficultyLevel}
                      </div>
                    )}
                  </div>
                </td>

                {/* Obra */}
                <td className="py-4 px-6">
                  <div>
                    <Link
                      href={`/works/${work.id}`}
                      className="font-semibold text-theme-primary hover:text-brand-primary transition-colors group-hover:text-brand-primary line-clamp-2"
                    >
                      {work.title}
                    </Link>
                    {work.subtitle && (
                      <p className="text-sm text-theme-tertiary mt-1 line-clamp-1">
                        {work.subtitle}
                      </p>
                    )}
                    {work.opOrCatalog && (
                      <p className="text-xs text-theme-tertiary mt-1">
                        {work.opOrCatalog}
                      </p>
                    )}
                  </div>
                </td>

                {/* Compositor */}
                <td className="py-4 px-6">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-gradient-to-br from-accent-blue to-accent-purple rounded-full flex items-center justify-center mr-2">
                      <FiUser className="w-3 h-3 text-theme-primary" />
                    </div>
                    <div>
                      <Link
                        href={`/composer/${work.composer.id}`}
                        className="font-medium text-theme-primary hover:text-accent-blue transition-colors text-sm"
                      >
                        {work.composer.fullName || work.composer.name}
                      </Link>
                      {work.compositionYear && (
                        <p className="text-xs text-theme-tertiary">
                          {work.compositionYear}
                        </p>
                      )}
                    </div>
                  </div>
                </td>

                {/* Instrumento */}
                <td className="py-4 px-6">
                  <div className="flex items-center">
                    <FiMusic className="w-4 h-4 text-brand-primary mr-2" />
                    <span className="text-sm text-theme-secondary font-medium">
                      {work.instrument.name}
                    </span>
                  </div>
                </td>

                {/* Partituras */}
                <td className="py-4 px-6">
                  <div className="flex items-center space-x-2">
                    {work.workScores && work.workScores.length > 0 ? (
                      <>
                        {work.workScores.slice(0, 2).map((score) => (
                          <Link
                            key={score.id}
                            href={score.downloadUrl || work.imslpPermlink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-2 py-1 bg-accent-green/10 border border-accent-green/30 text-accent-green rounded text-xs font-medium hover:bg-accent-green/20 transition-all duration-300"
                          >
                            <FiDownload className="w-3 h-3 mr-1" />
                            {score.fileFormat}
                          </Link>
                        ))}
                        {work.workScores.length > 2 && (
                          <span className="text-xs text-theme-tertiary">
                            +{work.workScores.length - 2} mais
                          </span>
                        )}
                      </>
                    ) : (
                      <Link
                        href={work.imslpPermlink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-2 py-1 bg-brand-primary/10 border border-brand-primary/30 text-brand-primary rounded text-xs font-medium hover:bg-brand-primary/20 transition-all duration-300"
                      >
                        <FiExternalLink className="w-3 h-3 mr-1" />
                        IMSLP
                      </Link>
                    )}
                  </div>
                </td>
              </AnimatedItem>
            ))}
          </tbody>
        </table>
      </div>

      {isPending && (
        <div className="absolute inset-0 bg-theme-overlay backdrop-blur-sm flex items-center justify-center">
          <div className="classical-card p-6 text-center">
            <div className="w-8 h-8 border-4 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-theme-primary font-medium text-sm">
              Carregando...
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
