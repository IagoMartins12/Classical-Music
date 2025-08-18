// // app/hooks/useTeacherReviews.ts - Hook para gerenciar avaliações do professor

// import {
//   ReviewData,
//   ReviewsStats,
//   TeacherReviewsData,
// } from '@/app/(teacher)/teacher/reviews/pageServer';
// import { useState, useCallback } from 'react';

// interface UseTeacherReviewsState {
//   reviews: ReviewData[];
//   stats: ReviewsStats;
//   pagination: {
//     offset: number;
//     limit: number;
//     total: number;
//     hasMore: boolean;
//   };
//   loading: {
//     reviews: boolean;
//     stats: boolean;
//     response: boolean;
//   };
//   error: string | null;
//   filters: {
//     rating: number | null; // 1-5 ou null para todas
//     timeperiod: 'all' | 'month' | 'quarter' | 'year';
//     visibility: 'all' | 'public' | 'private';
//     sortBy: 'newest' | 'oldest' | 'highest' | 'lowest';
//   };
// }

// interface UseTeacherReviewsActions {
//   // Data fetching
//   fetchReviews: (resetPagination?: boolean) => Promise<void>;
//   refreshReviews: () => Promise<void>;
//   loadMoreReviews: () => Promise<void>;

//   // Filtering and sorting
//   setRatingFilter: (rating: number | null) => void;
//   setTimePeriodFilter: (period: 'all' | 'month' | 'quarter' | 'year') => void;
//   setVisibilityFilter: (visibility: 'all' | 'public' | 'private') => void;
//   setSortBy: (sortBy: 'newest' | 'oldest' | 'highest' | 'lowest') => void;
//   clearFilters: () => void;

//   // Review responses (if needed in future)
//   respondToReview: (reviewId: string, response: string) => Promise<boolean>;

//   // Analytics and insights
//   getReviewInsights: () => {
//     trending: 'up' | 'down' | 'stable';
//     strongPoints: string[];
//     improvementAreas: string[];
//     recentTrend: number;
//   };

//   // State management
//   setInitialData: (data: TeacherReviewsData) => void;
//   clearError: () => void;
// }

// export function useTeacherReviews(
//   initialData?: TeacherReviewsData
// ): UseTeacherReviewsState & UseTeacherReviewsActions {
//   const [state, setState] = useState<UseTeacherReviewsState>({
//     reviews: initialData?.reviews || [],
//     stats: initialData?.stats || {
//       total: 0,
//       averageRating: 0,
//       ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
//       specificAverages: {
//         teachingQuality: 0,
//         communication: 0,
//         punctuality: 0,
//         preparation: 0,
//         patience: 0,
//         motivation: 0,
//       },
//       recommendationRate: 0,
//       publicReviews: 0,
//       privateReviews: 0,
//       recentReviews: 0,
//       thisMonthCount: 0,
//       lastMonthCount: 0,
//     },
//     pagination: initialData?.pagination || {
//       offset: 0,
//       limit: 20,
//       total: 0,
//       hasMore: false,
//     },
//     loading: {
//       reviews: false,
//       stats: false,
//       response: false,
//     },
//     error: null,
//     filters: {
//       rating: null,
//       timeperiod: 'all',
//       visibility: 'all',
//       sortBy: 'newest',
//     },
//   });

//   // Helper to update loading state
//   const setLoading = useCallback(
//     (key: keyof UseTeacherReviewsState['loading'], value: boolean) => {
//       setState((prev) => ({
//         ...prev,
//         loading: {
//           ...prev.loading,
//           [key]: value,
//         },
//       }));
//     },
//     []
//   );

//   // Helper to set error
//   const setError = useCallback((error: string | null) => {
//     setState((prev) => ({
//       ...prev,
//       error,
//     }));
//   }, []);

//   // Set initial data
//   const setInitialData = useCallback((data: TeacherReviewsData) => {
//     setState((prev) => ({
//       ...prev,
//       reviews: data.reviews,
//       stats: data.stats,
//       pagination: data.pagination,
//     }));
//   }, []);

//   // Build API query parameters
//   const buildQueryParams = useCallback(() => {
//     const params = new URLSearchParams();

//     params.append('limit', state.pagination.limit.toString());
//     params.append('includeStats', 'true');
//     params.append('includePrivate', 'true'); // Teacher can see private reviews about themselves

//     // Apply filters
//     if (state.filters.rating) {
//       params.append('rating', state.filters.rating.toString());
//     }

//     if (state.filters.visibility !== 'all') {
//       params.append(
//         'public',
//         (state.filters.visibility === 'public').toString()
//       );
//     }

//     if (state.filters.timeperiod !== 'all') {
//       const now = new Date();
//       let dateFrom: Date;

//       switch (state.filters.timeperiod) {
//         case 'month':
//           dateFrom = new Date(now.getFullYear(), now.getMonth(), 1);
//           break;
//         case 'quarter':
//           const quarter = Math.floor(now.getMonth() / 3);
//           dateFrom = new Date(now.getFullYear(), quarter * 3, 1);
//           break;
//         case 'year':
//           dateFrom = new Date(now.getFullYear(), 0, 1);
//           break;
//         default:
//           dateFrom = new Date(0);
//       }

//       params.append('dateFrom', dateFrom.toISOString());
//     }

//     // Sorting
//     params.append('sortBy', state.filters.sortBy);

//     return params;
//   }, [state.pagination.limit, state.filters]);

//   // Fetch reviews with current filters
//   const fetchReviews = useCallback(
//     async (resetPagination = false) => {
//       setLoading('reviews', true);
//       setError(null);

//       try {
//         const params = buildQueryParams();

//         if (resetPagination) {
//           params.set('offset', '0');
//         } else {
//           params.set('offset', state.pagination.offset.toString());
//         }

//         const response = await fetch(`/api/reviews?${params}`, {
//           method: 'GET',
//           headers: {
//             'Content-Type': 'application/json',
//           },
//         });

//         if (!response.ok) {
//           throw new Error('Erro ao buscar avaliações');
//         }

//         const data = await response.json();

//         if (!data.success) {
//           throw new Error(data.error || 'Erro desconhecido');
//         }

//         setState((prev) => ({
//           ...prev,
//           reviews: resetPagination
//             ? data.reviews
//             : [...prev.reviews, ...data.reviews],
//           stats: data.stats || prev.stats,
//           pagination: data.pagination,
//         }));
//       } catch (error) {
//         console.error('Erro ao buscar avaliações:', error);
//         setError(error instanceof Error ? error.message : 'Erro desconhecido');
//       } finally {
//         setLoading('reviews', false);
//       }
//     },
//     [buildQueryParams, state.pagination.offset, setLoading, setError]
//   );

//   // Refresh reviews
//   const refreshReviews = useCallback(async () => {
//     await fetchReviews(true);
//   }, [fetchReviews]);

//   // Load more reviews
//   const loadMoreReviews = useCallback(async () => {
//     if (!state.pagination.hasMore || state.loading.reviews) return;

//     setState((prev) => ({
//       ...prev,
//       pagination: {
//         ...prev.pagination,
//         offset: prev.pagination.offset + prev.pagination.limit,
//       },
//     }));

//     await fetchReviews(false);
//   }, [state.pagination.hasMore, state.loading.reviews, fetchReviews]);

//   // Filter setters
//   const setRatingFilter = useCallback((rating: number | null) => {
//     setState((prev) => ({
//       ...prev,
//       filters: { ...prev.filters, rating },
//       pagination: { ...prev.pagination, offset: 0 },
//     }));
//   }, []);

//   const setTimePeriodFilter = useCallback(
//     (timeperiod: 'all' | 'month' | 'quarter' | 'year') => {
//       setState((prev) => ({
//         ...prev,
//         filters: { ...prev.filters, timeperiod },
//         pagination: { ...prev.pagination, offset: 0 },
//       }));
//     },
//     []
//   );

//   const setVisibilityFilter = useCallback(
//     (visibility: 'all' | 'public' | 'private') => {
//       setState((prev) => ({
//         ...prev,
//         filters: { ...prev.filters, visibility },
//         pagination: { ...prev.pagination, offset: 0 },
//       }));
//     },
//     []
//   );

//   const setSortBy = useCallback(
//     (sortBy: 'newest' | 'oldest' | 'highest' | 'lowest') => {
//       setState((prev) => ({
//         ...prev,
//         filters: { ...prev.filters, sortBy },
//         pagination: { ...prev.pagination, offset: 0 },
//       }));
//     },
//     []
//   );

//   const clearFilters = useCallback(() => {
//     setState((prev) => ({
//       ...prev,
//       filters: {
//         rating: null,
//         timeperiod: 'all',
//         visibility: 'all',
//         sortBy: 'newest',
//       },
//       pagination: { ...prev.pagination, offset: 0 },
//     }));
//   }, []);

//   // Respond to review (future feature)
//   const respondToReview = useCallback(
//     async (reviewId: string, response: string): Promise<boolean> => {
//       setLoading('response', true);
//       setError(null);

//       try {
//         const apiResponse = await fetch('/api/reviews/responses', {
//           method: 'POST',
//           headers: {
//             'Content-Type': 'application/json',
//           },
//           body: JSON.stringify({ reviewId, response }),
//         });

//         if (!apiResponse.ok) {
//           throw new Error('Erro ao responder avaliação');
//         }

//         const data = await apiResponse.json();

//         if (!data.success) {
//           throw new Error(data.error || 'Erro ao responder avaliação');
//         }

//         // Update review in state
//         setState((prev) => ({
//           ...prev,
//           reviews: prev.reviews.map((review) =>
//             review.id === reviewId
//               ? { ...review, teacherResponse: response }
//               : review
//           ),
//         }));

//         return true;
//       } catch (error) {
//         console.error('Erro ao responder avaliação:', error);
//         setError(error instanceof Error ? error.message : 'Erro desconhecido');
//         return false;
//       } finally {
//         setLoading('response', false);
//       }
//     },
//     [setLoading, setError]
//   );

//   // Get insights from reviews
//   const getReviewInsights = useCallback(() => {
//     const { stats } = state;

//     // Calculate trend
//     const recentTrend = stats.thisMonthCount - stats.lastMonthCount;
//     const trending: 'up' | 'down' | 'stable' =
//       recentTrend > 2 ? 'up' : recentTrend < -2 ? 'down' : 'stable';

//     // Identify strong points (averages above 4.0)
//     const strongPoints: string[] = [];
//     const improvementAreas: string[] = [];

//     Object.entries(stats.specificAverages).forEach(([key, value]) => {
//       const label =
//         {
//           teachingQuality: 'Qualidade do Ensino',
//           communication: 'Comunicação',
//           punctuality: 'Pontualidade',
//           preparation: 'Preparação',
//           patience: 'Paciência',
//           motivation: 'Motivação',
//         }[key] || key;

//       if (value >= 4.0) {
//         strongPoints.push(label);
//       } else if (value < 3.5 && value > 0) {
//         improvementAreas.push(label);
//       }
//     });

//     return {
//       trending,
//       strongPoints,
//       improvementAreas,
//       recentTrend,
//     };
//   }, [state.stats]);

//   // Clear error
//   const clearError = useCallback(() => {
//     setError(null);
//   }, [setError]);

//   return {
//     // State
//     ...state,

//     // Actions
//     fetchReviews,
//     refreshReviews,
//     loadMoreReviews,
//     setRatingFilter,
//     setTimePeriodFilter,
//     setVisibilityFilter,
//     setSortBy,
//     clearFilters,
//     respondToReview,
//     getReviewInsights,
//     setInitialData,
//     clearError,
//   };
// }
