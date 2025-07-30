import Image from 'next/image';
import Link from 'next/link';

const HeroMainPage = () => {
  return (
    <div className="section-wrap flex flex-col lg:flex-row gap-6">
      {/* Seção Principal - História da Música */}
      <Link
        href="/music-history"
        className="relative w-full lg:w-8/12 rounded-2xl  !p-0 classical-card overflow-hidden group hover:scale-[1.02] transition-all duration-500 flex"
      >
        <div className="relative flex-1 h-96 md:h-80 lg:h-auto">
          <Image
            alt="Período clássico da música - Instrumentos históricos e partituras antigas"
            src="/classical-period-2.jpg"
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 60vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            priority
            quality={90}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

          {/* Conteúdo sobreposto */}
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <div className="mb-2">
              <span className="inline-block px-3 py-1 bg-blue-600/90 rounded-full text-sm font-medium mb-3">
                📚 Artigo em Destaque
              </span>
            </div>
            <h2 className="text-2xl lg:text-3xl font-bold mb-3 leading-tight">
              História da Música Clássica
            </h2>
            <p className="text-gray-200 text-base lg:text-lg mb-4 leading-relaxed line-clamp-3 md:line-clamp-none">
              Embarque em uma jornada fascinante através dos séculos, desde o
              canto gregoriano medieval até as inovações contemporâneas.
              Descubra como cada período histórico moldou a música que
              conhecemos e amamos hoje.
            </p>
            <div className="inline-flex items-center px-6 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full text-white font-semibold hover:bg-white/30 transition-all duration-300 group/btn">
              Explorar História Completa
              <svg
                className="ml-2 w-4 h-4 transition-transform group-hover/btn:translate-x-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </div>
        </div>
      </Link>

      {/* Seções Laterais */}
      <div className="w-full lg:w-4/12 flex flex-col gap-4">
        {/* Card Instrumentação */}
        <Link
          href="/instruments"
          className="relative rounded-2xl bg-white shadow-lg  !p-0 classical-card overflow-hidden group hover:scale-[1.02] transition-all duration-500"
        >
          <div className="relative h-64">
            <Image
              alt="Instrumentos clássicos - Violino, piano e outros instrumentos históricos"
              src="/instrument-2.jpg"
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              quality={85}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
              <div className="mb-2">
                <span className="inline-block px-2 py-1 bg-purple-600/90 rounded-full text-xs font-medium mb-2">
                  🎻 Instrumentos
                </span>
              </div>
              <h3 className="text-lg font-bold mb-2">
                Instrumentação Clássica
              </h3>
              <p className="text-gray-200 text-sm mb-3 leading-snug">
                Conheça a evolução dos instrumentos musicais e como cada um
                contribuiu para o desenvolvimento da música clássica ao longo
                dos séculos.
              </p>
              <div className="inline-flex items-center text-sm font-semibold text-white hover:text-purple-200 transition-colors group/div">
                Descobrir mais
                <svg
                  className="ml-1 w-3 h-3 transition-transform group-hover/link:translate-x-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </div>
          </div>
        </Link>

        {/* Card Sobre o Projeto */}
        <Link
          href="/about-us"
          className="relative rounded-2xl bg-white shadow-lg !p-0 classical-card overflow-hidden group hover:scale-[1.02] transition-all duration-500"
        >
          <div className="relative h-64">
            <Image
              alt="Ambiente de estudo musical - Partituras, metrônomo e instrumentos musicais"
              src="/wallpaper.jpg"
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              quality={85}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
              <div className="mb-2">
                <span className="inline-block px-2 py-1 bg-green-600/90 rounded-full text-xs font-medium mb-2">
                  🎼 Sobre Nós
                </span>
              </div>
              <h3 className="text-lg font-bold mb-2">Nossa Missão</h3>
              <p className="text-gray-200 text-sm mb-3 leading-snug">
                Democratizar o acesso à música clássica através de uma
                plataforma completa que combina conhecimento histórico com
                ferramentas práticas de estudo.
              </p>
              <div className="inline-flex items-center text-sm font-semibold text-white hover:text-green-200 transition-colors group/link">
                Conheça nossa história
                <svg
                  className="ml-1 w-3 h-3 transition-transform group-hover/link:translate-x-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default HeroMainPage;
