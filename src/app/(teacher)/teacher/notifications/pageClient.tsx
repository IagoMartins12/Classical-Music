// app/(teacher)/notifications/pageClient.tsx
'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import {
  PiArrowSquareOut,
  PiArrowsClockwise,
  PiBell,
  PiCalendarBlank,
  PiCheck,
  PiCheckCircle,
  PiClock,
  PiFileText,
  PiFunnel,
  PiInfo,
  PiUser,
  PiWarning,
} from 'react-icons/pi';
import {
  AnimatedContainer,
  AnimatedCard,
  AnimatedItem,
  PageContainer,
} from '../../../components/animation/AnimatedComponents';
import { NotificationData } from '@/app/types/notification';
import {
  fetchNotificationsPage,
  markAllNotificationsRead,
  markNotificationRead,
} from '@/app/requests/portal/notifications';
import { useToast } from '@/app/hooks/useToast';
import Select from '@/app/components/Common/Select';
import { useTranslation } from '@/app/context/TranslationContext';
import { Inline } from '@/app/components/ui/Layout';
import { Button } from '@/app/components/ui/Button';
import { Card } from '@/app/components/ui/Card';

interface TeacherNotificationsPageClientProps {
  initialNotifications: NotificationData[];
  unreadCount: number;
  notificationStats: Array<{ type: string; _count: { id: number } }>;
  errorMessage?: string;
}

type FilterType = 'all' | 'unread' | 'lessons' | 'assignments' | 'students';
type SortType = 'newest' | 'oldest' | 'priority';

export default function TeacherNotificationsPageClient({
  initialNotifications,
  unreadCount: initialUnreadCount,
  errorMessage,
}: TeacherNotificationsPageClientProps) {
  const { t } = useTranslation({ sections: ['teacher/notifications'] });

  const [notifications, setNotifications] =
    useState<NotificationData[]>(initialNotifications);
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<FilterType>('all');
  const [sort, setSort] = useState<SortType>('newest');
  const [hasMore, setHasMore] = useState(true);

  const toast = useToast();

  const NotificationsSelectFilter = [
    { value: 'newest', label: t('sort_newest') },
    { value: 'oldest', label: t('sort_oldest') },
    { value: 'priority', label: t('sort_priority') },
  ];

  const filteredNotifications = notifications
    .filter((notification) => {
      switch (filter) {
        case 'unread':
          return notification.status === 'UNREAD';
        case 'lessons':
          return notification.type.includes('LESSON');
        case 'assignments':
          return notification.type.includes('ASSIGNMENT');
        case 'students':
          return notification.type.includes('STUDENT');
        default:
          return true;
      }
    })
    .sort((a, b) => {
      switch (sort) {
        case 'oldest':
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        case 'priority':
          const priorityOrder = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        default: // newest
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
      }
    });

  const markAsRead = useCallback(
    async (notificationId: string) => {
      try {
        await markNotificationRead(notificationId);

        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notificationId
              ? { ...n, status: 'READ' as const, readAt: new Date() }
              : n
          )
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
        toast.success('Notificação marcada como lida');
      } catch {
        toast.error('Erro ao marcar notificação como lida');
      }
    },
    [toast]
  );

  const markAllAsRead = useCallback(async () => {
    try {
      setLoading(true);
      await markAllNotificationsRead();

      setNotifications((prev) =>
        prev.map((n) => ({
          ...n,
          status: 'READ' as const,
          readAt: new Date(),
        }))
      );
      setUnreadCount(0);
      toast.success('Todas as notificações marcadas como lidas');
    } catch {
      toast.error('Erro ao marcar todas como lidas');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const loadMoreNotifications = useCallback(async () => {
    if (loading || !hasMore) return;

    try {
      setLoading(true);
      // A primeira carga traz até 50; a próxima página de 20 parte do que já
      // está na tela, e as repetidas ficam de fora.
      const newNotifications = await fetchNotificationsPage(
        Math.floor(notifications.length / 20) + 1,
        20
      );
      const known = new Set(notifications.map((n) => n.id));
      const fresh = newNotifications.filter((n) => !known.has(n.id));

      if (fresh.length > 0) {
        setNotifications((prev) => [...prev, ...fresh]);
      } else {
        setHasMore(false);
      }
    } catch {
      toast.error('Erro ao carregar mais notificações');
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, notifications, toast]);

  const formatTime = (date: Date | string) => {
    const now = new Date();
    const notificationDate = new Date(date);
    const diffInHours =
      (now.getTime() - notificationDate.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInHours * 60);
      return `${diffInMinutes} ${t('min_ago')}`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}${t('hours_ago')}`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}${t('days_ago')}`;
    }
  };

  const getNotificationIcon = (type: string, priority: string) => {
    if (type.includes('LESSON')) return <PiCalendarBlank className="w-5 h-5" />;
    if (type.includes('ASSIGNMENT')) return <PiFileText className="w-5 h-5" />;
    if (type.includes('STUDENT')) return <PiUser className="w-5 h-5" />;

    if (priority === 'HIGH' || priority === 'CRITICAL') {
      return <PiWarning className="w-5 h-5" />;
    } else if (priority === 'MEDIUM') {
      return <PiClock className="w-5 h-5" />;
    } else {
      return <PiInfo className="w-5 h-5" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH':
      case 'CRITICAL':
        return 'bg-gradient-to-r to-transparent';
      case 'MEDIUM':
        return 'bg-gradient-to-r to-transparent';
      default:
        return 'bg-gradient-to-r to-transparent';
    }
  };

  const getFilterIcon = (filterType: FilterType) => {
    switch (filterType) {
      case 'lessons':
        return <PiCalendarBlank className="w-4 h-4" />;
      case 'assignments':
        return <PiFileText className="w-4 h-4" />;
      case 'students':
        return <PiUser className="w-4 h-4" />;
      case 'unread':
        return <PiBell className="w-4 h-4" />;
      default:
        return <PiFunnel className="w-4 h-4" />;
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return t('priority_urgent');
      case 'CRITICAL':
        return t('priority_critical');
      case 'MEDIUM':
        return t('priority_important');
      default:
        return t('priority_informative');
    }
  };

  if (errorMessage) {
    return (
      <PageContainer showBackground={true}>
        <div className="flex items-center justify-center min-h-screen">
          <Card densidade="larga" className="text-center max-w-md">
            <PiWarning className="w-16 h-16 mx-auto mb-4" />
            <h1 className="text-xl font-bold text-theme-primary mb-2">
              {t('error_loading')}
            </h1>
            <p className="text-theme-secondary mb-4">{errorMessage}</p>
            <Button
              variante="primario"
              type="submit"
              onClick={() => window.location.reload()}
            >
              {t('try_again')}
            </Button>
          </Card>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer showBackground={true}>
      <AnimatedContainer delay={0.1} staggerSpeed="normal">
        {/* Header */}
        <AnimatedItem direction="up" springType="gentle">
          <div className="text-center mb-8 py-8">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 rounded-3xl flex items-center justify-center shadow-theme-glow">
                <PiBell className="w-8 h-8 text-theme-primary" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gradient-brand classical-title mb-4">
              {t('page_title')}
            </h1>
            <p className="text-xl text-theme-secondary classical-subtitle medida-texto mx-auto">
              {t('page_subtitle')}
            </p>
          </div>
        </AnimatedItem>

        {/* Stats Cards */}
        {/* <AnimatedItem direction="up" springType="gentle">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <AnimatedCard
              hover="scale"
              className="classical-card p-6 text-center"
            >
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3">
                <PiBell className="w-6 h-6 text-theme-primary" />
              </div>
              <div className="text-2xl font-bold text-theme-primary mb-1">
                {unreadCount}
              </div>
              <div className="text-sm text-theme-tertiary">
                {t('stats_unread')}
              </div>
            </AnimatedCard>

            <AnimatedCard
              hover="scale"
              className="classical-card p-6 text-center"
            >
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3">
                <PiCalendarBlank className="w-6 h-6 text-theme-primary" />
              </div>
              <div className="text-2xl font-bold text-theme-primary mb-1">
                {notificationStats
                  .filter((s) => s.type.includes('LESSON'))
                  .reduce((acc, s) => acc + s._count.id, 0)}
              </div>
              <div className="text-sm text-theme-tertiary">
                {t('stats_about_lessons')}
              </div>
            </AnimatedCard>

            <AnimatedCard
              hover="scale"
              className="classical-card p-6 text-center"
            >
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3">
                <PiFileText className="w-6 h-6 text-theme-primary" />
              </div>
              <div className="text-2xl font-bold text-theme-primary mb-1">
                {notificationStats
                  .filter((s) => s.type.includes('ASSIGNMENT'))
                  .reduce((acc, s) => acc + s._count.id, 0)}
              </div>
              <div className="text-sm text-theme-tertiary">
                {t('stats_about_assignments')}
              </div>
            </AnimatedCard>

            <AnimatedCard
              hover="scale"
              className="classical-card p-6 text-center"
            >
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3">
                <PiUser className="w-6 h-6 text-theme-primary" />
              </div>
              <div className="text-2xl font-bold text-theme-primary mb-1">
                {notificationStats
                  .filter((s) => s.type.includes('STUDENT'))
                  .reduce((acc, s) => acc + s._count.id, 0)}
              </div>
              <div className="text-sm text-theme-tertiary">
                {t('stats_about_students')}
              </div>
            </AnimatedCard>
          </div>
        </AnimatedItem> */}

        {/* Controls */}
        <AnimatedItem direction="up" springType="gentle">
          <Card className="mb-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              {/* Filters */}
              <div className="flex flex-wrap gap-2">
                {(
                  [
                    'all',
                    'unread',
                    'lessons',
                    'assignments',
                    'students',
                  ] as FilterType[]
                ).map((filterType) => (
                  <button
                    key={filterType}
                    onClick={() => setFilter(filterType)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all ${
                      filter === filterType
                        ? 'text-theme-primary border'
                        : 'bg-theme-elevated text-theme-secondary'
                    }`}
                  >
                    {getFilterIcon(filterType)}
                    <span className="capitalize">
                      {filterType === 'all'
                        ? t('filter_all')
                        : filterType === 'unread'
                          ? t('filter_unread')
                          : filterType === 'lessons'
                            ? t('filter_lessons')
                            : filterType === 'assignments'
                              ? t('filter_assignments')
                              : t('filter_students')}
                    </span>
                  </button>
                ))}
              </div>

              {/* Actions */}
              <Inline gap={3}>
                <Select
                  options={NotificationsSelectFilter}
                  value={sort}
                  onChange={(e) => setSort(e.target.value as SortType)}
                />

                {unreadCount > 0 && (
                  <Inline
                    as="button"
                    gap={2}
                    onClick={markAllAsRead}
                    disabled={loading}
                    className="btn-classical-secondary"
                  >
                    <PiCheckCircle className="w-4 h-4" />
                    <span>{t('mark_all')}</span>
                  </Inline>
                )}
              </Inline>
            </div>
          </Card>
        </AnimatedItem>

        {/* Notifications List */}
        <AnimatedItem direction="up" springType="gentle">
          <div className="space-y-4">
            {loading && notifications.length === 0 ? (
              <div className="text-center py-12">
                <PiArrowsClockwise className="w-8 h-8 animate-spin text-ouro-texto mx-auto mb-4" />
                <p className="text-theme-secondary">{t('loading')}</p>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="classical-card p-12 text-center">
                <PiBell className="w-16 h-16 text-theme-tertiary mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-bold text-theme-primary mb-2">
                  {filter === 'all'
                    ? t('no_notifications')
                    : t('no_notifications_found')}
                </h3>
                <p className="text-theme-secondary mb-6">
                  {filter === 'all'
                    ? t('no_notifications_description')
                    : t('filter_description')}
                </p>

                {filter !== 'all' && (
                  <Button
                    variante="primario"
                    type="submit"
                    onClick={() => setFilter('all')}
                  >
                    {t('view_all_notifications')}
                  </Button>
                )}
              </div>
            ) : (
              <>
                {filteredNotifications.map((notification) => (
                  <AnimatedCard
                    key={notification.id}
                    hover="lift"
                    className={`classical-card ${getPriorityColor(
                      notification.priority
                    )} ${notification.status === 'UNREAD' ? 'ring-1' : ''}`}
                  >
                    <div className="p-6">
                      <div className="flex items-start space-x-4">
                        {/* Icon */}
                        <div className="flex-shrink-0 mt-1">
                          {getNotificationIcon(
                            notification.type,
                            notification.priority
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3
                                className={`text-lg font-semibold ${
                                  notification.status === 'UNREAD'
                                    ? 'text-theme-primary'
                                    : 'text-theme-secondary'
                                }`}
                              >
                                {notification.title}
                              </h3>
                              <p className="text-theme-tertiary mt-1">
                                {notification.message}
                              </p>

                              {/* Metadata */}
                              <Inline
                                gap={4}
                                className="mt-3 text-sm text-theme-tertiary"
                              >
                                <span>
                                  {formatTime(notification.createdAt)}
                                </span>
                                <span
                                  className={`px-2 py-1 rounded-full text-xs ${
                                    notification.priority === 'HIGH' ||
                                    notification.priority === 'CRITICAL'
                                      ? ''
                                      : notification.priority === 'MEDIUM'
                                        ? ''
                                        : ''
                                  }`}
                                >
                                  {getPriorityLabel(notification.priority)}
                                </span>
                              </Inline>
                            </div>

                            {/* Actions */}
                            <Inline gap={2} className="ml-4">
                              {notification.actionUrl && (
                                <Link
                                  href={notification.actionUrl}
                                  onClick={() => markAsRead(notification.id)}
                                  className="btn-classical-primary text-sm flex items-center space-x-1"
                                >
                                  <span>
                                    {notification.actionText || t('view')}
                                  </span>
                                  <PiArrowSquareOut className="w-3 h-3" />
                                </Link>
                              )}

                              {notification.status === 'UNREAD' && (
                                <button
                                  onClick={() => markAsRead(notification.id)}
                                  className="p-2 rounded-lg transition-colors"
                                  title={t('mark_as_read')}
                                >
                                  <PiCheck className="w-4 h-4 text-theme-tertiary" />
                                </button>
                              )}
                            </Inline>
                          </div>
                        </div>
                      </div>
                    </div>
                  </AnimatedCard>
                ))}

                {/* Load More */}
                {hasMore && (
                  <div className="text-center py-8">
                    <Inline
                      as="button"
                      gap={2}
                      onClick={loadMoreNotifications}
                      disabled={loading}
                      className="btn-classical-secondary mx-auto"
                    >
                      <PiArrowsClockwise
                        className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`}
                      />
                      <span>{loading ? t('loading') : t('load_more')}</span>
                    </Inline>
                  </div>
                )}
              </>
            )}
          </div>
        </AnimatedItem>
      </AnimatedContainer>
    </PageContainer>
  );
}
