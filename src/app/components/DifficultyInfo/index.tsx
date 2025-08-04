// app/difficulty/components/DifficultyInfo.tsx

'use client';

import { FiX, FiInfo, FiAward } from 'react-icons/fi';
import { DIFFICULTY_INFO } from '@/app/requests/difficulty-details';
import { AnimatedItem, AnimatedCard } from '../animation/AnimatedComponents';
import { FaGraduationCap } from 'react-icons/fa';

interface DifficultyInfoProps {
  onClose: () => void;
}

export default function DifficultyInfo({ onClose }: DifficultyInfoProps) {
  return (
    <AnimatedCard hover="none" className="classical-card p-6 mb-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-gradient-to-br from-accent-blue to-accent-purple rounded-2xl flex items-center justify-center mr-4">
            <FiInfo className="w-6 h-6 text-theme-primary" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-theme-primary classical-title">
              Sobre os Níveis de Dificuldade
            </h3>
            <p className="text-theme-secondary">
              Entenda os sistemas de classificação que utilizamos
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 bg-theme-elevated border border-theme-secondary rounded-lg flex items-center justify-center hover:border-brand-primary hover:bg-brand-primary/10 transition-all duration-300"
        >
          <FiX className="w-4 h-4 text-theme-secondary" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Sistema IMSLP */}
        <AnimatedItem direction="left">
          <div className="bg-theme-elevated rounded-xl p-6 border border-theme-secondary">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-brand-primary/20 rounded-lg flex items-center justify-center mr-3">
                <FiAward className="w-5 h-5 text-brand-primary" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-theme-primary">
                  {DIFFICULTY_INFO.IMSLP.name}
                </h4>
                <p className="text-sm text-theme-secondary">
                  Baseado na comunidade IMSLP
                </p>
              </div>
            </div>

            <p className="text-theme-secondary mb-4 text-sm leading-relaxed">
              {DIFFICULTY_INFO.IMSLP.description}
            </p>

            <div className="space-y-2">
              <h5 className="text-sm font-semibold text-theme-primary mb-3">
                Principais Níveis:
              </h5>
              {Object.entries(DIFFICULTY_INFO.IMSLP.levels)
                .slice(0, 6)
                .map(([level, description]) => (
                  <div key={level} className="flex items-start space-x-3">
                    <span className="inline-flex items-center justify-center w-6 h-6 bg-brand-primary/10 border border-brand-primary/30 text-brand-primary rounded text-xs font-bold">
                      {level}
                    </span>
                    <p className="text-xs text-theme-secondary leading-relaxed">
                      {description}
                    </p>
                  </div>
                ))}
              <p className="text-xs text-theme-tertiary italic mt-3">
                Níveis 7-12 são progressivamente mais avançados...
              </p>
            </div>
          </div>
        </AnimatedItem>

        {/* Sistema RCM */}
        <AnimatedItem direction="right">
          <div className="bg-theme-elevated rounded-xl p-6 border border-theme-secondary">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-accent-purple/20 rounded-lg flex items-center justify-center mr-3">
                <FaGraduationCap className="w-5 h-5 text-accent-purple" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-theme-primary">
                  {DIFFICULTY_INFO.RCM.name}
                </h4>
                <p className="text-sm text-theme-secondary">
                  Sistema canadense oficial
                </p>
              </div>
            </div>

            <p className="text-theme-secondary mb-4 text-sm leading-relaxed">
              {DIFFICULTY_INFO.RCM.description}
            </p>

            <div className="space-y-2">
              <h5 className="text-sm font-semibold text-theme-primary mb-3">
                Estrutura RCM:
              </h5>
              {Object.entries(DIFFICULTY_INFO.RCM.levels)
                .slice(0, 6)
                .map(([level, description]) => (
                  <div key={level} className="flex items-start space-x-3">
                    <span className="inline-flex items-center justify-center min-w-[2rem] h-6 bg-accent-purple/10 border border-accent-purple/30 text-accent-purple rounded text-xs font-bold px-1">
                      {level}
                    </span>
                    <p className="text-xs text-theme-secondary leading-relaxed">
                      {description}
                    </p>
                  </div>
                ))}
              <p className="text-xs text-theme-tertiary italic mt-3">
                Níveis 7-10 são para estudantes avançados...
              </p>
            </div>
          </div>
        </AnimatedItem>
      </div>

      {/* Explicação sobre a base IMSLP */}
      <AnimatedItem direction="up" delay={0.2}>
        <div className="mt-6 p-4 bg-brand-primary/5 border border-brand-primary/20 rounded-xl">
          <div className="flex items-start space-x-3">
            <FiInfo className="w-5 h-5 text-brand-primary mt-0.5 flex-shrink-0" />
            <div>
              <h5 className="text-sm font-semibold text-brand-primary mb-2">
                Nossa Base de Dados
              </h5>
              <p className="text-sm text-theme-secondary leading-relaxed">
                As classificações de dificuldade em nosso site são baseadas no{' '}
                <strong>
                  International Music Score Library Project (IMSLP)
                </strong>
                , uma das maiores bibliotecas digitais de partituras de domínio
                público. Utilizamos seus sistemas de classificação, incluindo os
                níveis IMSLP e as referências RCM, para fornecer orientação
                precisa sobre a dificuldade técnica das obras.
              </p>
            </div>
          </div>
        </div>
      </AnimatedItem>
    </AnimatedCard>
  );
}
