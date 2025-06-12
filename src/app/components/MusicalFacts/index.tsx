// app/components/MusicalFacts/MusicalFacts.tsx
'use client';

import { FiBookOpen, FiZap, FiStar, FiInfo } from 'react-icons/fi';
import { GiMusicalNotes } from 'react-icons/gi';
import { useState } from 'react';
import SectionTitle from '../Utils/SectionTitle';

interface MusicalFact {
  id: string;
  type: string;
  icon: string;
  title: string;
  content: string;
  category: string;
}

interface MusicalFactsProps {
  facts: MusicalFact[];
}

const FactCard = ({ fact, index }: { fact: MusicalFact; index: number }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Definir estilos por tipo de curiosidade
  const getFactStyle = (type: string) => {
    const styles = {
      curiosity: {
        gradient: 'from-blue-600/20 to-cyan-500/20',
        border: 'border-blue-500/30',
        accent: 'text-blue-400',
        bg: 'bg-blue-500/10',
      },
      anniversary: {
        gradient: 'from-pink-600/20 to-rose-500/20',
        border: 'border-pink-500/30',
        accent: 'text-pink-400',
        bg: 'bg-pink-500/10',
      },
      instrument: {
        gradient: 'from-purple-600/20 to-violet-500/20',
        border: 'border-purple-500/30',
        accent: 'text-purple-400',
        bg: 'bg-purple-500/10',
      },
      technique: {
        gradient: 'from-emerald-600/20 to-green-500/20',
        border: 'border-emerald-500/30',
        accent: 'text-emerald-400',
        bg: 'bg-emerald-500/10',
      },
      record: {
        gradient: 'from-amber-600/20 to-yellow-500/20',
        border: 'border-amber-500/30',
        accent: 'text-amber-400',
        bg: 'bg-amber-500/10',
      },
      innovation: {
        gradient: 'from-orange-600/20 to-red-500/20',
        border: 'border-orange-500/30',
        accent: 'text-orange-400',
        bg: 'bg-orange-500/10',
      },
    };

    return (
      styles[type as keyof typeof styles] || {
        gradient: 'from-brand-primary/20 to-brand-secondary/20',
        border: 'border-brand-primary/30',
        accent: 'text-brand-primary',
        bg: 'bg-brand-primary/10',
      }
    );
  };

  const style = getFactStyle(fact.type);

  // Animação escalonada baseada no índice
  const animationDelay = `${index * 100}ms`;

  return (
    <div
      className={`
        classical-card-simple overflow-hidden transition-all duration-500 ease-out 
        group hover:scale-[1.02] cursor-pointer relative
        bg-gradient-to-br ${style.gradient} border ${style.border}
        animate-fade-in-up
      `}
      style={{ animationDelay }}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div
            className={`w-12 h-12 rounded-2xl ${style.bg} border ${style.border} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}
          >
            <span className="text-2xl">{fact.icon}</span>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <h3
                className={`text-lg font-bold classical-title group-hover:${style.accent} transition-colors duration-300`}
              >
                {fact.title}
              </h3>

              {/* Category badge */}
              <span
                className={`inline-flex items-center px-2 py-1 ${style.bg} border ${style.border} rounded-full text-xs font-medium ${style.accent}`}
              >
                {fact.category}
              </span>
            </div>

            {/* Content preview */}
            <p
              className={`text-theme-secondary leading-relaxed transition-all duration-300 ${
                isExpanded ? '' : 'line-clamp-3'
              }`}
            >
              {fact.content}
            </p>

            {/* Expand/collapse indicator */}
            {fact.content.length > 150 && (
              <button className="mt-3 flex items-center gap-2 text-sm font-medium text-theme-tertiary hover:text-theme-primary transition-colors duration-300">
                <span>{isExpanded ? 'Mostrar menos' : 'Ler mais'}</span>
                <svg
                  className={`w-4 h-4 transition-transform duration-300 ${
                    isExpanded ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Interactive elements */}
      <div className="px-6 pb-6">
        <div className="flex items-center justify-between pt-4 border-t border-theme-secondary/50">
          <div className="flex items-center space-x-2 text-theme-tertiary text-sm">
            <div
              className={`w-2 h-2 rounded-full animate-pulse`}
              style={{ backgroundColor: style.accent.split('-')[1] }}
            ></div>
            <span className="font-medium">Curiosidade Musical</span>
          </div>

          <div className="flex items-center gap-2">
            <FiInfo
              className={`w-4 h-4 transition-colors duration-300 group-hover:${style.accent}`}
            />
            <span className="text-xs text-theme-tertiary group-hover:text-theme-secondary transition-colors duration-300">
              Toque para {isExpanded ? 'recolher' : 'expandir'}
            </span>
          </div>
        </div>
      </div>

      {/* Hover effect overlay */}
      <div
        className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl pointer-events-none bg-gradient-to-br ${style.gradient}`}
      ></div>

      {/* Floating decoration */}
      <div className="absolute top-4 right-4 opacity-20 group-hover:opacity-40 transition-opacity duration-500">
        <GiMusicalNotes className={`w-5 h-5 ${style.accent}`} />
      </div>
    </div>
  );
};

const MusicalFacts: React.FC<MusicalFactsProps> = ({ facts }) => {
  return (
    <section className="section-wrap relative">
      <SectionTitle
        title="Curiosidades Musicais"
        subtitle="Fatos fascinantes e histórias interessantes do mundo da música clássica"
        linkText="Ver mais curiosidades"
        linkHref="/curiosities"
        icon={<FiBookOpen className="w-6 h-6" />}
        accent="blue"
      />

      {/* Facts grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {facts.map((fact, index) => (
          <FactCard key={fact.id} fact={fact} index={index} />
        ))}
      </div>

      {/* Knowledge section footer */}
      <div className="mt-8 text-center">
        <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-2xl text-blue-400 text-sm font-medium backdrop-blur-sm">
          <FiStar className="w-5 h-5" />
          <span>Expandindo horizontes musicais diariamente</span>
          <FiZap className="w-5 h-5 animate-pulse" />
        </div>
      </div>

      {/* Floating fact bubbles decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-24 h-24 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-32 h-32 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-full blur-3xl"></div>
        <div
          className="absolute top-1/2 left-1/4 w-16 h-16 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full blur-2xl animate-pulse"
          style={{ animationDelay: '1s' }}
        ></div>
      </div>
    </section>
  );
};

export default MusicalFacts;
