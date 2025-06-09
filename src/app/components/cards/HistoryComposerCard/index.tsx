'use client';

import { useState } from 'react';
import { FaUser, FaCalendarAlt, FaInfoCircle } from 'react-icons/fa';

interface Composer {
  id: string;
  name: string;
  fullName: string;
  portraitUrl: string | null;
  birthDate: string | null;
  deathDate: string | null;
  bio: string | null;
}

interface Props {
  composer: Composer;
}

export function HistoryComposerCard({ composer }: Props) {
  const [imageError, setImageError] = useState(false);
  const [showBio, setShowBio] = useState(false);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '?';
    return new Date(dateString).getFullYear().toString();
  };

  const getLifespan = () => {
    const birth = formatDate(composer.birthDate);
    const death = formatDate(composer.deathDate);
    return `${birth} - ${death}`;
  };

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden border border-gray-100">
      <div className="p-6">
        <div className="flex items-start space-x-4">
          {/* Portrait */}
          <div className="flex-shrink-0">
            {composer.portraitUrl && !imageError ? (
              <img
                src={composer.portraitUrl}
                alt={composer.fullName}
                className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                <FaUser className="text-white text-xl" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-gray-900 truncate">
              {composer.fullName}
            </h4>
            <div className="flex items-center text-sm text-gray-600 mt-1">
              <FaCalendarAlt className="mr-1 flex-shrink-0" />
              <span>{getLifespan()}</span>
            </div>

            {composer.bio && (
              <button
                onClick={() => setShowBio(!showBio)}
                className="flex items-center text-sm text-blue-600 hover:text-blue-700 mt-2 transition-colors"
              >
                <FaInfoCircle className="mr-1" />
                {showBio ? 'Ocultar biografia' : 'Ver biografia'}
              </button>
            )}
          </div>
        </div>

        {/* Biography */}
        {showBio && composer.bio && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-sm text-gray-700 leading-relaxed">
              {composer.bio.length > 200
                ? `${composer.bio.substring(0, 200)}...`
                : composer.bio}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
