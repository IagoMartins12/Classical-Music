import Image from 'next/image';
import Link from 'next/link';
import {
  FiCalendar,
  FiClock,
  FiEye,
  FiMail,
  FiMapPin,
  FiMusic,
  FiPause,
  FiPlay,
  FiPlus,
  FiTarget,
  FiUsers,
} from 'react-icons/fi';
import { ViewMode } from '../../ViewModeToggle';
import { TeacherStudentsServerData } from '@/app/(teacher)/teacher/students/pageServer';

interface StudentCardProps {
  studentRelationship: TeacherStudentsServerData['students'][0];
  viewMode: ViewMode;
  onToggleStatus: (relationshipId: string, isPaused: boolean) => void;
  formatDate: (date: Date | string) => string;
  formatTime: (date: Date | string) => string;
}

function StudentCard({
  studentRelationship,
  viewMode,
  onToggleStatus,
  formatDate,
  formatTime,
}: StudentCardProps) {
  const { student, relationship, stats, nextLesson } = studentRelationship;

  const isActive = relationship.isActive && !relationship.pausedAt;
  const isPaused = relationship.isActive && !!relationship.pausedAt;
  const isInactive = !relationship.isActive;

  const getStatusColor = () => {
    if (isActive) return 'accent-green';
    if (isPaused) return 'accent-yellow';
    return 'accent-red';
  };

  const getStatusText = () => {
    if (isActive) return 'Ativo';
    if (isPaused) return 'Pausado';
    return 'Inativo';
  };

  return (
    <div
      className={`classical-card p-6 group hover:shadow-theme-glow transition-all ${
        viewMode === 'list' ? 'flex items-center space-x-6' : ''
      }`}
    >
      <div
        className={`${
          viewMode === 'list' ? 'flex items-center space-x-4 flex-1' : ''
        }`}
      >
        {/* Header */}
        <div className="flex items-center gap-4 mb-4">
          {/* Avatar */}
          <div className="relative w-16 h-16">
            {student.image ? (
              <div className="relative w-full h-full rounded-full overflow-hidden border-3 border-brand-primary/20 group-hover:border-brand-primary/50 transition-all">
                <Image
                  src={student.image}
                  alt={student.name}
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-brand-primary to-brand-secondary rounded-full flex items-center justify-center border-3 border-brand-primary/20 group-hover:border-brand-primary/50 transition-all">
                <FiUsers className="w-8 h-8 text-theme-primary" />
              </div>
            )}
          </div>

          {/* Basic Info */}
          <div className="flex-1">
            <h3 className="font-bold text-theme-primary group-hover:text-brand-primary transition-colors text-lg">
              {student.name}
            </h3>
            <div className="flex items-center space-x-2 text-sm text-theme-tertiary">
              <FiMail className="w-3 h-3" />
              <span>{student.email}</span>
            </div>
            {student.location && (
              <div className="flex items-center space-x-2 text-sm text-theme-tertiary">
                <FiMapPin className="w-3 h-3" />
                <span>{student.location}</span>
              </div>
            )}
          </div>

          {/* Status Badge */}
          <div className="flex flex-col items-end space-y-2">
            <span
              className={`px-3 py-1 border rounded-full text-xs font-medium bg-${getStatusColor()}/10 border-${getStatusColor()}/30 text-${getStatusColor()}`}
            >
              {getStatusText()}
            </span>
            <div className="flex items-center space-x-1">
              <Link
                href={`/teacher/students/${student.id}`}
                className="w-8 h-8 rounded-lg bg-theme-elevated border border-theme-secondary hover:border-brand-primary transition-all flex items-center justify-center group/btn"
              >
                <FiEye className="w-4 h-4 text-theme-tertiary group-hover/btn:text-brand-primary transition-colors" />
              </Link>
              {isActive && (
                <button
                  onClick={() =>
                    onToggleStatus(studentRelationship.relationshipId, false)
                  }
                  className="w-8 h-8 rounded-lg bg-theme-elevated border border-theme-secondary hover:border-accent-yellow transition-all flex items-center justify-center group/btn"
                  title="Pausar aluno"
                >
                  <FiPause className="w-4 h-4 text-theme-tertiary group-hover/btn:text-accent-yellow transition-colors" />
                </button>
              )}
              {isPaused && (
                <button
                  onClick={() =>
                    onToggleStatus(studentRelationship.relationshipId, true)
                  }
                  className="w-8 h-8 rounded-lg bg-theme-elevated border border-theme-secondary hover:border-accent-green transition-all flex items-center justify-center group/btn"
                  title="Reativar aluno"
                >
                  <FiPlay className="w-4 h-4 text-theme-tertiary group-hover/btn:text-accent-green transition-colors" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Student Details */}
        <div className="space-y-3 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-sm">
              <FiTarget className="w-4 h-4 text-accent-blue" />
              <span className="text-theme-secondary">Nível:</span>
              <span className="text-theme-primary font-medium">
                {student.level}
              </span>
            </div>
            {student.mainInstrument && (
              <div className="flex items-center space-x-2 text-sm">
                <FiMusic className="w-4 h-4 text-accent-purple" />
                <span className="text-theme-primary font-medium">
                  {student.mainInstrument}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2">
              <FiCalendar className="w-4 h-4 text-accent-green" />
              <span className="text-theme-secondary">Início:</span>
              <span className="text-theme-primary">
                {formatDate(relationship.startDate)}
              </span>
            </div>
            <div className="text-xs text-theme-tertiary">
              {relationship.maxLessonsPerWeek}x por semana •{' '}
              {relationship.lessonDuration}min
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <div className="text-lg font-bold text-brand-primary">
              {stats.totalLessons}
            </div>
            <div className="text-xs text-theme-tertiary">Total</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-accent-green">
              {stats.completedLessons}
            </div>
            <div className="text-xs text-theme-tertiary">Concluídas</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-accent-blue">
              {stats.completionRate}%
            </div>
            <div className="text-xs text-theme-tertiary">Taxa</div>
          </div>
        </div>

        {/* Next Lesson */}
        {nextLesson && isActive && (
          <div className="p-3 bg-gradient-to-r from-theme-elevated to-interactive-hover rounded-lg border border-theme-primary/20">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-theme-primary">
                  Próxima aula
                </div>
                <div className="text-xs text-theme-tertiary">
                  {formatDate(nextLesson.scheduledAt)} às{' '}
                  {formatTime(nextLesson.scheduledAt)}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <FiClock className="w-4 h-4 text-brand-primary" />
                <span className="text-xs text-brand-primary font-medium">
                  {nextLesson.duration}min
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Pause/Inactive Reason */}
        {(isPaused || isInactive) && relationship.pauseReason && (
          <div className="p-3 bg-gradient-to-r from-accent-red/5 to-accent-red/10 rounded-lg border border-accent-red/20">
            <div className="text-sm text-accent-red">
              <strong>Motivo:</strong> {relationship.pauseReason}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-theme-secondary">
          <Link
            href={`/teacher/students/${student.id}`}
            className="text-brand-primary hover:text-brand-secondary text-sm font-medium transition-colors flex items-center space-x-1"
          >
            <span>Ver Detalhes</span>
            <FiEye className="w-3 h-3" />
          </Link>

          <div className="flex items-center space-x-2">
            <Link
              href={`/teacher/lessons/create?studentId=${student.id}`}
              className="text-accent-blue hover:text-accent-purple text-sm font-medium transition-colors flex items-center space-x-1"
            >
              <FiPlus className="w-3 h-3" />
              <span>Nova Aula</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentCard;
