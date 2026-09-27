// app/difficulty/components/DifficultyInfo.tsx

'use client';

import { PiGraduationCap, PiInfo, PiMedal, PiX } from 'react-icons/pi';
import { DIFFICULTY_INFO } from '@/app/requests/difficulty-details';
import { AnimatedItem, AnimatedCard } from '../animation/AnimatedComponents';
import { Text } from '@/app/components/ui/Text';
import { NomeAcao } from '@/app/components/ui/NomeAcao';
import { Stack } from '@/app/components/ui/Layout';

interface DifficultyInfoProps {
  onClose: () => void;
}

export default function DifficultyInfo({ onClose }: DifficultyInfoProps) {
  return (
    <AnimatedCard hover="none" className="classical-card p-6 mb-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-aviso rounded-2xl flex items-center justify-center mr-4">
            <PiInfo className="w-6 h-6 text-theme-primary" />
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
          className="w-8 h-8 bg-theme-elevated border border-theme-secondary rounded-lg flex items-center justify-center hover:border-ouro hover:bg-ouro/10 transition-all duration-300"
        >
          <PiX className="w-4 h-4 text-theme-secondary" />
          <NomeAcao acao="fechar" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Sistema IMSLP */}
        <AnimatedItem direction="left">
          <Stack className="bg-theme-elevated rounded-xl p-6 border border-theme-secondary">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-ouro/20 rounded-lg flex items-center justify-center mr-3">
                <PiMedal className="w-5 h-5 text-brand-primary" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-theme-primary">
                  {DIFFICULTY_INFO.IMSLP.name}
                </h4>
                <Text papel="rotulo" tom="suave" as="p">
                  Baseado na comunidade IMSLP
                </Text>
              </div>
            </div>

            <Text papel="rotulo" tom="suave" as="p" className="leading-relaxed">
              {DIFFICULTY_INFO.IMSLP.description}
            </Text>

            <div className="space-y-2">
              <h5 className="text-sm font-semibold text-theme-primary mb-3">
                Principais Níveis:
              </h5>
              {Object.entries(DIFFICULTY_INFO.IMSLP.levels)
                .slice(0, 6)
                .map(([level, description]) => (
                  <div key={level} className="flex items-start space-x-3">
                    <Text
                      papel="legenda"
                      tom="ouro"
                      className="inline-flex items-center justify-center w-6 h-6 bg-ouro/10 border border-ouro/30 rounded font-bold"
                    >
                      {level}
                    </Text>
                    <Text
                      papel="legenda"
                      tom="suave"
                      as="p"
                      className="leading-relaxed"
                    >
                      {description}
                    </Text>
                  </div>
                ))}
              <Text papel="legenda" tom="fraco" as="p" className="italic mt-3">
                Níveis 7-12 são progressivamente mais avançados...
              </Text>
            </div>
          </Stack>
        </AnimatedItem>

        {/* Sistema RCM */}
        <AnimatedItem direction="right">
          <Stack className="bg-theme-elevated rounded-xl p-6 border border-theme-secondary">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-ouro/20 rounded-lg flex items-center justify-center mr-3">
                <PiGraduationCap className="w-5 h-5 text-ouro-texto" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-theme-primary">
                  {DIFFICULTY_INFO.RCM.name}
                </h4>
                <Text papel="rotulo" tom="suave" as="p">
                  Sistema canadense oficial
                </Text>
              </div>
            </div>

            <Text papel="rotulo" tom="suave" as="p" className="leading-relaxed">
              {DIFFICULTY_INFO.RCM.description}
            </Text>

            <div className="space-y-2">
              <h5 className="text-sm font-semibold text-theme-primary mb-3">
                Estrutura RCM:
              </h5>
              {Object.entries(DIFFICULTY_INFO.RCM.levels)
                .slice(0, 6)
                .map(([level, description]) => (
                  <div key={level} className="flex items-start space-x-3">
                    <span className="inline-flex items-center justify-center min-w-[2rem] h-6 bg-ouro/10 border border-ouro/30 text-ouro-texto rounded text-xs font-bold px-1">
                      {level}
                    </span>
                    <Text
                      papel="legenda"
                      tom="suave"
                      as="p"
                      className="leading-relaxed"
                    >
                      {description}
                    </Text>
                  </div>
                ))}
              <Text papel="legenda" tom="fraco" as="p" className="italic mt-3">
                Níveis 7-10 são para estudantes avançados...
              </Text>
            </div>
          </Stack>
        </AnimatedItem>
      </div>

      {/* Explicação sobre a base IMSLP */}
      <AnimatedItem direction="up" delay={0.2}>
        <div className="mt-6 p-4 bg-ouro/5 border border-ouro/20 rounded-xl">
          <div className="flex items-start space-x-3">
            <PiInfo className="w-5 h-5 text-brand-primary mt-0.5 flex-shrink-0" />
            <Stack gap={2}>
              <h5 className="text-sm font-semibold text-brand-primary">
                Nossa Base de Dados
              </h5>
              <Text
                papel="rotulo"
                tom="suave"
                as="p"
                className="leading-relaxed"
              >
                As classificações de dificuldade em nosso site são baseadas no{' '}
                <strong>
                  International Music Score Library Project (IMSLP)
                </strong>
                , uma das maiores bibliotecas digitais de partituras de domínio
                público. Utilizamos seus sistemas de classificação, incluindo os
                níveis IMSLP e as referências RCM, para fornecer orientação
                precisa sobre a dificuldade técnica das obras.
              </Text>
            </Stack>
          </div>
        </div>
      </AnimatedItem>
    </AnimatedCard>
  );
}
