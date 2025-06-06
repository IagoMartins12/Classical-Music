// app/composer/[composerId]/ComposerDetailsClient.tsx
'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ComposerDetails, ComposerWork } from '@/app/requests/composer-details';
import { CiCalendar } from 'react-icons/ci';
import { LuBookOpen, LuMapPin } from 'react-icons/lu';
import { FaExternalLinkAlt, FaRegUser, FaUserTie } from 'react-icons/fa';
import { MdPeople } from 'react-icons/md';
import ComposerBiography from '../ComposerBiography';
import ComposerWorks from '../ComposersClient/ComposerWorks';

interface ComposerDetailsClientProps {
  composer: ComposerDetails;
  works: ComposerWork[];
}

export default function ComposerDetailsClient({
  composer,
  works,
}: ComposerDetailsClientProps) {
  const [imageError, setImageError] = useState(false);

  // Calcular idade e anos de vida
  const calculateLifeSpan = () => {
    if (!composer.birthDate && !composer.deathDate) return null;

    const birth = composer.birthDate ? new Date(composer.birthDate) : null;
    const death = composer.deathDate
      ? new Date(composer.deathDate)
      : new Date();

    if (birth && death) {
      const years = death.getFullYear() - birth.getFullYear();
      return years;
    }
    return null;
  };

  const lifeSpan = calculateLifeSpan();
  console.log('composer', composer);

  // Assumindo que composer tem uma propriedade roleNames (array de strings)
  const secondaryRoles = composer.roleNames || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8 px-4">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm text-gray-600">
          <Link
            href="/composers"
            className="hover:text-blue-600 transition-colors"
          >
            Compositores
          </Link>
          <span className="mx-2">›</span>
          <span className="text-gray-900">{composer.name}</span>
        </nav>

        {/* Header Principal */}
        <div className="bg-white rounded-lg shadow-sm border p-8 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Informações do Compositor */}
            <div className="lg:col-span-2 space-y-6">
              {/* Nome e título */}
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                  {composer.name}
                </h1>
                {composer.fullName !== composer.name && (
                  <p className="text-xl text-gray-600">{composer.fullName}</p>
                )}
              </div>

              {/* Grid de informações */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Nascimento */}
                {composer.birthDate && (
                  <div className="flex items-start space-x-3">
                    <CiCalendar className="w-5 h-5 text-gray-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Nascimento
                      </p>
                      <p className="text-gray-900">
                        {new Date(composer.birthDate).getFullYear() + 1}
                      </p>
                    </div>
                  </div>
                )}

                {/* Falecimento ou Idade */}
                {composer.deathDate ? (
                  <div className="flex items-start space-x-3">
                    <CiCalendar className="w-5 h-5 text-gray-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Falecimento
                      </p>
                      <p className="text-gray-900">
                        {new Date(composer.deathDate).getFullYear() + 1}
                        {lifeSpan && (
                          <span className="text-gray-600 ml-2">
                            ({lifeSpan} anos)
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                ) : (
                  composer.birthDate && (
                    <div className="flex items-start space-x-3">
                      <CiCalendar className="w-5 h-5 text-gray-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          Idade
                        </p>
                        <p className="text-gray-900">{lifeSpan} anos (vivo)</p>
                      </div>
                    </div>
                  )
                )}

                {/* Época */}
                <div className="flex items-start space-x-3">
                  <LuMapPin className="w-5 h-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Época</p>
                    <p className="text-blue-600 font-medium">
                      {composer.epochName}
                    </p>
                  </div>
                </div>

                {/* Papel Principal */}
                {composer.primaryRoleName && (
                  <div className="flex items-start space-x-3">
                    <FaRegUser className="w-5 h-5 text-gray-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Papel Principal
                      </p>
                      <p className="text-gray-900">
                        {composer.primaryRoleName}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Links Externos */}
              <div className="flex flex-wrap gap-3">
                {composer.wikipediaLink && (
                  <a
                    href={composer.wikipediaLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <FaExternalLinkAlt className="w-4 h-4 mr-2" />
                    Wikipedia
                  </a>
                )}

                {composer.permLinkImslp && (
                  <a
                    href={composer.permLinkImslp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <LuBookOpen className="w-4 h-4 mr-2" />
                    IMSLP
                  </a>
                )}
              </div>
            </div>

            {/* Imagem do Compositor */}
            <div className="flex justify-center lg:justify-end">
              {composer.portraitUrl && !imageError ? (
                <div className="relative w-64 h-80 rounded-lg overflow-hidden shadow-lg">
                  <Image
                    src={composer.portraitUrl}
                    alt={composer.name}
                    fill
                    sizes="256px"
                    className="object-cover"
                    priority
                    onError={() => setImageError(true)}
                  />
                </div>
              ) : (
                <div className="w-64 h-80 bg-gray-200 rounded-lg flex items-center justify-center shadow-lg">
                  <div className="text-center text-gray-500">
                    <FaRegUser className="w-16 h-16 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Sem imagem disponível</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Seção de Papéis Secundários */}
        {secondaryRoles.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border p-8 mb-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full">
                <FaUserTie className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Papéis Secundários
                </h2>
                <p className="text-gray-600">
                  Outras funções exercidas por {composer.name}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              {secondaryRoles.map((role, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-full text-sm font-medium text-blue-800 shadow-sm hover:shadow-md transition-shadow"
                >
                  <MdPeople className="w-4 h-4 mr-2 text-blue-600" />
                  {role}
                </span>
              ))}
            </div>

            {secondaryRoles.length > 5 && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  <strong>{composer.name}</strong> exerceu{' '}
                  <strong>{secondaryRoles.length} funções diferentes</strong> ao
                  longo de sua carreira, demonstrando sua versatilidade no mundo
                  musical.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Biografia */}
        {
          <div className="bg-white rounded-lg shadow-sm border p-8 mb-8">
            <div className="flex items-center space-x-2 mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Biografia</h2>
              <div className="relative group">
                <svg
                  className="w-5 h-5 text-gray-400 hover:text-gray-600 cursor-help transition-colors"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
                    clipRule="evenodd"
                  />
                </svg>
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                  Biografia gerada automaticamente por IA
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                </div>
              </div>
            </div>
            <ComposerBiography
              composerId={composer.id}
              initialBio={composer.bio}
              composerName={composer.name}
            />
          </div>
        }

        {/* Estatísticas */}
        <div className="bg-white rounded-lg shadow-sm border p-8  mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Estatísticas
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {composer.worksCount}
              </div>
              <div className="text-sm text-gray-600">Obras Catalogadas</div>
            </div>

            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {composer.epochName}
              </div>
              <div className="text-sm text-gray-600">Período Musical</div>
            </div>

            {lifeSpan && (
              <div className="text-center p-6 bg-gray-50 rounded-lg">
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  {lifeSpan}
                </div>
                <div className="text-sm text-gray-600">Anos de Vida</div>
              </div>
            )}
          </div>
        </div>

        <ComposerWorks works={works} composerName={composer.name} />
      </div>
    </div>
  );
}
