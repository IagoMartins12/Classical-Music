// app/components/TeacherSystem/StudentCard.tsx - Updated with Translations
'use client';

import { useState } from 'react';
import Image from '@/app/components/SmartImage';
import Link from 'next/link';
import {
  PiArrowsClockwise,
  PiCalendarBlank,
  PiEye,
  PiPause,
  PiPlay,
  PiUser,
} from 'react-icons/pi';
import { translateNivel } from '@/app/utils';
import { AnimatedCard } from '../../animation/AnimatedComponents';
import { ViewMode } from '../../ViewModeToggle';
import { TeacherStudentsServerData } from '@/app/(teacher)/teacher/students/pageServer';
import { Stack, Inline } from '@/app/components/ui/Layout';
import { Text } from '@/app/components/ui/Text';

interface StudentCardTranslations {
  studentSince: string;
  totalLessons: string;
  completionRate: string;
  nextLesson: string;
  atTime: string;
  statusActive: string;
  statusInactive: string;
  statusPaused: string;
  reactivate: string;
  pause: string;
  viewDetails: string;
  studentLevel: string;
  studentInstrument: string;
}

interface StudentCardProps {
  studentRelationship: TeacherStudentsServerData['students'][0];
  viewMode: ViewMode;
  onToggleStatus: (relationshipId: string, isPaused: boolean) => Promise<void>;
  formatDate: (date: Date | string) => string;
  formatTime: (date: Date | string) => string;
  translations: StudentCardTranslations;
}

export default function StudentCard({
  studentRelationship,
  viewMode,
  onToggleStatus,
  formatDate,
  formatTime,
  translations,
}: StudentCardProps) {
  const [isToggling, setIsToggling] = useState(false);

  const { student, relationship, nextLesson } = studentRelationship;

  // Status helpers
  const isActive = relationship.isActive && !relationship.pausedAt;
  const isPaused = relationship.isActive && !!relationship.pausedAt;

  const getStatusColor = () => {
    if (isActive) return 'accent-green';
    if (isPaused) return 'accent-yellow';
    return 'accent-red';
  };

  const getStatusText = () => {
    if (isActive) return translations.statusActive;
    if (isPaused) return translations.statusPaused;
    return translations.statusInactive;
  };

  const handleToggleStatus = async () => {
    setIsToggling(true);
    try {
      await onToggleStatus(studentRelationship.relationshipId, isPaused);
    } catch (error) {
      console.error('Error toggling student status:', error);
    } finally {
      setIsToggling(false);
    }
  };

  if (viewMode === 'list') {
    return (
      <AnimatedCard hover="lift" className="classical-card p-4">
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className="relative w-12 h-12 flex-shrink-0">
            {student.image ? (
              <div className="relative w-full h-full rounded-full overflow-hidden border-2 border-brand-primary/20">
                <Image
                  src={student.image}
                  alt={student.name}
                  fill
                  sizes="48px"
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-brand-primary to-brand-secondary rounded-full flex items-center justify-center border-2 border-brand-primary/20">
                <PiUser className="w-6 h-6 text-theme-primary" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-theme-primary truncate">
              {student.name}
            </h3>
            <Inline gap={4} className="text-sm text-theme-tertiary">
              {student.experienceLevel && (
                <span>
                  {translations.studentLevel}{' '}
                  {translateNivel(student.experienceLevel)}
                </span>
              )}
              {student.mainInstrument && (
                <span>
                  {translations.studentInstrument} {student.mainInstrument}
                </span>
              )}
            </Inline>
            <Text papel="rotulo" tom="suave" as="p">
              {translations.studentSince} {formatDate(relationship.startDate)}
            </Text>
          </div>

          {/* Stats */}
          {/* <div className="flex items-center space-x-6 text-center">
            <div>
              <div className="text-lg font-bold text-brand-primary">
                {stats.totalLessons}
              </div>
              <div className="text-xs text-theme-tertiary">
                {translations.totalLessons}
              </div>
            </div>
            <div>
              <div className="text-lg font-bold text-accent-green">
                {stats.completionRate}%
              </div>
              <div className="text-xs text-theme-tertiary">
                {translations.completionRate}
              </div>
            </div>
          </div> */}

          {/* Next Lesson */}
          <div className="w-32 text-center">
            {nextLesson ? (
              <div>
                <Text
                  papel="rotulo"
                  tom="forte"
                  as="div"
                  className="font-medium"
                >
                  {translations.nextLesson}
                </Text>
                <Text papel="legenda" tom="fraco" as="div">
                  {formatDate(nextLesson.scheduledAt)} {translations.atTime}{' '}
                  {formatTime(nextLesson.scheduledAt)}
                </Text>
              </div>
            ) : (
              <Text papel="legenda" tom="fraco" as="div">
                -
              </Text>
            )}
          </div>

          {/* Status & Actions */}
          <Inline gap={3}>
            <span
              className={`px-3 py-1 border rounded-full text-xs font-medium bg-${getStatusColor()}/10 border-${getStatusColor()}/30 text-${getStatusColor()}`}
            >
              {getStatusText()}
            </span>

            <Inline gap={2}>
              <button
                onClick={handleToggleStatus}
                disabled={isToggling}
                className={`w-8 h-8 rounded-lg border transition-all flex items-center justify-center ${
                  isPaused
                    ? 'border-accent-green/30 hover:bg-accent-green/10 hover:border-accent-green text-accent-green'
                    : 'border-accent-yellow/30 hover:bg-accent-yellow/10 hover:border-accent-yellow text-accent-yellow'
                }`}
                title={isPaused ? translations.reactivate : translations.pause}
              >
                {isToggling ? (
                  <PiArrowsClockwise className="w-4 h-4 animate-spin" />
                ) : isPaused ? (
                  <PiPlay className="w-4 h-4" />
                ) : (
                  <PiPause className="w-4 h-4" />
                )}
              </button>

              <Link
                href={`/teacher/students/${student.id}`}
                className="w-8 h-8 rounded-lg bg-theme-elevated border border-theme-secondary hover:border-brand-primary transition-all flex items-center justify-center group"
                title={translations.viewDetails}
              >
                <PiEye className="w-4 h-4 text-theme-tertiary group-hover:text-brand-primary transition-colors" />
              </Link>
            </Inline>
          </Inline>
        </div>
      </AnimatedCard>
    );
  }

  // Card view
  return (
    <AnimatedCard hover="lift" className="classical-card p-6">
      <div className="flex items-start justify-between mb-4">
        {/* Avatar & Basic Info */}
        <Inline gap={4}>
          <div className="relative w-16 h-16">
            {student.image ? (
              <div className="relative w-full h-full rounded-full overflow-hidden border-2 border-brand-primary/20">
                <Image
                  src={student.image}
                  alt={student.name}
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-brand-primary to-brand-secondary rounded-full flex items-center justify-center border-2 border-brand-primary/20">
                <PiUser className="w-8 h-8 text-theme-primary" />
              </div>
            )}
          </div>

          <div className="flex-1">
            <h3 className="text-lg font-bold text-theme-primary mb-1">
              {student.name}
            </h3>
            <Text papel="rotulo" tom="suave" as="div" className="space-y-1">
              {student.experienceLevel && (
                <p>
                  {translations.studentLevel}{' '}
                  {translateNivel(student.experienceLevel)}
                </p>
              )}
              {student.mainInstrument && (
                <p>
                  {translations.studentInstrument} {student.mainInstrument}
                </p>
              )}
              <p>
                {translations.studentSince} {formatDate(relationship.startDate)}
              </p>
            </Text>
          </div>
        </Inline>

        {/* Status Badge */}
        <span
          className={`px-3 py-1 border rounded-full text-xs font-medium bg-${getStatusColor()}/10 border-${getStatusColor()}/30 text-${getStatusColor()}`}
        >
          {getStatusText()}
        </span>
      </div>

      {/* Stats Grid */}
      {/* <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center p-3 bg-theme-elevated rounded-lg">
          <div className="text-xl font-bold text-brand-primary mb-1">
            {stats.totalLessons}
          </div>
          <div className="text-sm text-theme-tertiary">
            {translations.totalLessons}
          </div>
        </div>

        <div className="text-center p-3 bg-theme-elevated rounded-lg">
          <div className="text-xl font-bold text-accent-green mb-1">
            {stats.completionRate}%
          </div>
          <div className="text-sm text-theme-tertiary">
            {translations.completionRate}
          </div>
        </div>
      </div> */}

      {/* Next Lesson */}
      {nextLesson && (
        <div className="mb-4 p-3 bg-theme-elevated to-interactive-hover rounded-lg">
          <div className="flex items-center justify-between">
            <Stack gap={1}>
              <Text papel="rotulo" tom="forte" as="div" className="font-medium">
                {translations.nextLesson}
              </Text>
              <Text papel="legenda" tom="fraco" as="div">
                {formatDate(nextLesson.scheduledAt)} {translations.atTime}{' '}
                {formatTime(nextLesson.scheduledAt)}
              </Text>
            </Stack>
            <PiCalendarBlank className="w-4 h-4 text-brand-primary" />
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <Inline gap={3}>
        <button
          onClick={handleToggleStatus}
          disabled={isToggling}
          className={`flex-1 btn-classical-secondary text-sm flex items-center justify-center space-x-2 ${
            isPaused
              ? 'hover:bg-accent-green/10 hover:border-accent-green/30 hover:text-accent-green'
              : 'hover:bg-accent-yellow/10 hover:border-accent-yellow/30 hover:text-accent-yellow'
          }`}
        >
          {isToggling ? (
            <PiArrowsClockwise className="w-4 h-4 animate-spin" />
          ) : isPaused ? (
            <PiPlay className="w-4 h-4" />
          ) : (
            <PiPause className="w-4 h-4" />
          )}
          <span>
            {isToggling
              ? '...'
              : isPaused
                ? translations.reactivate
                : translations.pause}
          </span>
        </button>

        <Link
          href={`/teacher/students/${student.id}`}
          className="flex-1 btn-classical-primary text-sm flex items-center justify-center space-x-2"
        >
          <PiEye className="w-4 h-4" />
          <span>{translations.viewDetails}</span>
        </Link>
      </Inline>
    </AnimatedCard>
  );
}
