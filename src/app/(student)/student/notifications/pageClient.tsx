// app/(student)/notifications/pageClient.tsx
'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import {
  FiBell,
  FiCheck,
  FiCheckCircle,
  FiClock,
  FiAlertTriangle,
  FiInfo,
  FiFilter,
  FiRefreshCw,
  FiExternalLink,
  FiCalendar,
  FiFileText,
  FiMusic,
  FiBookOpen,
} from 'react-icons/fi';
import {
  AnimatedContainer,
  AnimatedCard,
  AnimatedItem,
  PageContainer,
} from '../../../components/animation/AnimatedComponents';
import { NotificationData } from '@/app/types/notification';
import { useToast } from '@/app/hooks/useToast';
import Select from '@/app/components/Common/Select';
import { useTranslation } from '@/app/context/TranslationContext';

interface StudentNotificationsPageClientProps {
  initialNotifications: NotificationData[];
  unreadCount: number;
  notificationStats: Array<{ type: string; _count: { id: number } }>;
  errorMessage?: string;
}

type FilterType = 'all' | 'unread' | 'lessons' | 'assignments' | 'practice';
type SortType = 'newest' | 'oldest' | 'priority';

export default function StudentNotificationsPageClient({
  initialNotifications,
  unreadCount: initialUnreadCount,
  notificationStats,
  errorMessage,
}: StudentNotificationsPageClientProps) {
  const { t } = useTranslation({ sections: ['student/notifications'] });

  console.log('notificationStats', notificationStats);
  const [notifications, setNotifications] =
    useState<NotificationData[]>(initialNotifications);
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<FilterType>('all');
  const [sort, setSort] = useState<SortType>('newest');
  const [page, setPage] = useState(1);
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
        case 'practice':
          return (
            notification.type.includes('PRACTICE') ||
            notification.type.includes('FEEDBACK')
          );
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
        const response = await fetch(
          `/api/student/notifications/${notificationId}/mark-read`,
          {
            method: 'POST',
          }
        );

        if (response.ok) {
          setNotifications((prev) =>
            prev.map((n) =>
              n.id === notificationId
                ? { ...n, status: 'READ' as const, readAt: new Date() }
                : n
            )
          );
          setUnreadCount((prev) => Math.max(0, prev - 1));
          toast.success(t('notification_marked_read'));
        }
      } catch {
        toast.error(t('error_mark_read'));
      }
    },
    [toast, t]
  );

  const markAllAsRead = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/student/notifications/mark-all-read', {
        method: 'POST',
      });

      if (response.ok) {
        setNotifications((prev) =>
          prev.map((n) => ({
            ...n,
            status: 'READ' as const,
            readAt: new Date(),
          }))
        );
        setUnreadCount(0);
        toast.success(t('all_notifications_marked_read'));
      }
    } catch {
      toast.error(t('error_mark_all_read'));
    } finally {
      setLoading(false);
    }
  }, [toast, t]);

  const loadMoreNotifications = useCallback(async () => {
    if (loading || !hasMore) return;

    try {
      setLoading(true);
      const response = await fetch(
        `/api/student/notifications?page=${page + 1}&limit=20`
      );

      if (response.ok) {
        const data = await response.json();
        const newNotifications = data.notifications;

        if (newNotifications.length > 0) {
          setNotifications((prev) => [...prev, ...newNotifications]);
          setPage((prev) => prev + 1);
        } else {
          setHasMore(false);
        }
      }
    } catch {
      toast.error(t('error_load_more'));
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, page, toast, t]);

  const formatTime = (date: Date | string) => {
    const now = new Date();
    const notificationDate = new Date(date);
    const diffInHours =
      (now.getTime() - notificationDate.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInHours * 60);
      return t('time_minutes_ago', { minutes: diffInMinutes });
    } else if (diffInHours < 24) {
      return t('time_hours_ago', { hours: Math.floor(diffInHours) });
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return t('time_days_ago', { days: diffInDays });
    }
  };

  const getNotificationIcon = (type: string, priority: string) => {
    if (type.includes('LESSON')) return <FiCalendar className="w-5 h-5" />;
    if (type.includes('ASSIGNMENT')) return <FiFileText className="w-5 h-5" />;
    if (type.includes('PRACTICE') || type.includes('FEEDBACK'))
      return <FiMusic className="w-5 h-5" />;

    if (priority === 'HIGH' || priority === 'CRITICAL') {
      return <FiAlertTriangle className="w-5 h-5 text-accent-red" />;
    } else if (priority === 'MEDIUM') {
      return <FiClock className="w-5 h-5 text-accent-amber" />;
    } else {
      return <FiInfo className="w-5 h-5 text-accent-blue" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH':
      case 'CRITICAL':
        return 'border-l-accent-red bg-gradient-to-r from-accent-red/5 to-transparent';
      case 'MEDIUM':
        return 'border-l-accent-amber bg-gradient-to-r from-accent-amber/5 to-transparent';
      default:
        return 'border-l-accent-green bg-gradient-to-r from-accent-green/5 to-transparent';
    }
  };

  const getFilterIcon = (filterType: FilterType) => {
    switch (filterType) {
      case 'lessons':
        return <FiCalendar className="w-4 h-4" />;
      case 'assignments':
        return <FiFileText className="w-4 h-4" />;
      case 'practice':
        return <FiMusic className="w-4 h-4" />;
      case 'unread':
        return <FiBell className="w-4 h-4" />;
      default:
        return <FiFilter className="w-4 h-4" />;
    }
  };

  const getPriorityLabel = (priority: string) => {
    const priorityMap: { [key: string]: string } = {
      HIGH: t('priority_urgent'),
      CRITICAL: t('priority_critical'),
      MEDIUM: t('priority_important'),
      LOW: t('priority_informative'),
    };
    return priorityMap[priority] || priority;
  };

  const getTypeLabel = (type: string) => {
    if (type.includes('LESSON')) return t('type_lesson');
    if (type.includes('ASSIGNMENT')) return t('type_assignment');
    if (type.includes('PRACTICE')) return t('type_study');
    if (type.includes('FEEDBACK')) return t('type_feedback');
    return t('type_general');
  };

  if (errorMessage) {
    return (
      <PageContainer showBackground={true}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="classical-card p-8 text-center max-w-md">
            <FiAlertTriangle className="w-16 h-16 text-accent-red mx-auto mb-4" />
            <h1 className="text-xl font-bold text-theme-primary mb-2">
              {t('error_loading')}
            </h1>
            <p className="text-theme-secondary mb-4">{errorMessage}</p>
            <button
              onClick={() => window.location.reload()}
              className="btn-classical-primary"
            >
              {t('error_try_again')}
            </button>
          </div>
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
              <div className="w-16 h-16 bg-gradient-to-br from-accent-green to-accent-blue rounded-3xl flex items-center justify-center shadow-theme-glow">
                <FiBell className="w-8 h-8 text-theme-primary" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gradient-brand classical-title mb-4">
              {t('title')}
            </h1>
            <p className="text-xl text-theme-secondary classical-subtitle">
              {t('subtitle')}
            </p>
          </div>
        </AnimatedItem>

        {/* Controls */}
        <AnimatedItem direction="up" springType="gentle">
          <div className="classical-card p-6 mb-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              {/* Filters */}
              <div className="flex flex-wrap gap-2">
                {(
                  [
                    'all',
                    'unread',
                    'lessons',
                    'assignments',
                    'practice',
                  ] as FilterType[]
                ).map((filterType) => (
                  <button
                    key={filterType}
                    onClick={() => setFilter(filterType)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all ${
                      filter === filterType
                        ? 'bg-accent-green text-theme-primary border border-accent-green'
                        : 'bg-theme-elevated text-theme-secondary hover:bg-interactive-hover border border-theme-secondary'
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
                        : t('filter_studies')}
                    </span>
                  </button>
                ))}
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-3">
                <Select
                  options={NotificationsSelectFilter}
                  value={sort}
                  onChange={(e) => setSort(e.target.value as SortType)}
                />
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    disabled={loading}
                    className="btn-classical-secondary flex items-center space-x-2"
                  >
                    <FiCheckCircle className="w-4 h-4" />
                    <span>{t('mark_all')}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </AnimatedItem>

        {/* Notifications List */}
        <AnimatedItem direction="up" springType="gentle">
          <div className="space-y-4">
            {filteredNotifications.length > 0 ? (
              <>
                {filteredNotifications.map((notification) => (
                  <AnimatedCard
                    key={notification.id}
                    hover="lift"
                    className={`classical-card border-l-4 ${getPriorityColor(
                      notification.priority
                    )} ${
                      notification.status === 'UNREAD'
                        ? 'ring-1 ring-accent-green/20'
                        : ''
                    }`}
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
                              <div className="flex items-center space-x-4 mt-3 text-sm text-theme-tertiary">
                                <span>
                                  {formatTime(notification.createdAt)}
                                </span>
                                <span
                                  className={`px-2 py-1 rounded-full text-xs ${
                                    notification.priority === 'HIGH' ||
                                    notification.priority === 'CRITICAL'
                                      ? 'bg-accent-red/10 text-accent-red'
                                      : notification.priority === 'MEDIUM'
                                      ? 'bg-accent-amber/10 text-accent-amber'
                                      : 'bg-accent-green/10 text-accent-green'
                                  }`}
                                >
                                  {getPriorityLabel(notification.priority)}
                                </span>

                                {/* Type Badge */}
                                <span className="px-2 py-1 rounded-full text-xs bg-theme-elevated border border-theme-secondary">
                                  {getTypeLabel(notification.type)}
                                </span>
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center space-x-2 ml-4">
                              {notification.actionUrl && (
                                <Link
                                  href={notification.actionUrl}
                                  onClick={() => markAsRead(notification.id)}
                                  className="btn-classical-primary text-sm flex items-center space-x-1"
                                >
                                  <span>
                                    {notification.actionText || t('view')}
                                  </span>
                                  <FiExternalLink className="w-3 h-3" />
                                </Link>
                              )}

                              {notification.status === 'UNREAD' && (
                                <button
                                  onClick={() => markAsRead(notification.id)}
                                  className="p-2 rounded-lg hover:bg-interactive-hover transition-colors"
                                  title={t('mark_read')}
                                >
                                  <FiCheck className="w-4 h-4 text-theme-tertiary hover:text-accent-green" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </AnimatedCard>
                ))}

                {/* Load More */}
                {hasMore && (
                  <div className="text-center py-8">
                    <button
                      onClick={loadMoreNotifications}
                      disabled={loading}
                      className="btn-classical-secondary flex items-center space-x-2 mx-auto"
                    >
                      <FiRefreshCw
                        className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`}
                      />
                      <span>{loading ? t('loading') : t('load_more')}</span>
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="classical-card p-12 text-center">
                <FiBell className="w-16 h-16 text-theme-tertiary mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-bold text-theme-primary mb-2">
                  {filter === 'all'
                    ? t('no_notifications')
                    : t('no_notifications_found')}
                </h3>
                <p className="text-theme-secondary mb-6">
                  {filter === 'all' ? t('up_to_date') : t('adjust_filters')}
                </p>

                {filter !== 'all' && (
                  <button
                    onClick={() => setFilter('all')}
                    className="btn-classical-primary"
                  >
                    {t('view_all_notifications')}
                  </button>
                )}

                {filter === 'all' && (
                  <Link
                    href="/learning"
                    className="btn-classical-primary inline-flex items-center space-x-2"
                  >
                    <FiBookOpen className="w-4 h-4" />
                    <span>{t('explore_studies')}</span>
                  </Link>
                )}
              </div>
            )}
          </div>
        </AnimatedItem>
      </AnimatedContainer>
    </PageContainer>
  );
}
