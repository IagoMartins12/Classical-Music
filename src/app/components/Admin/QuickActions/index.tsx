// // app/components/Admin/QuickActions.tsx
// 'use client';

// import { AdminStats } from '@/app/hooks/admin/useAdminStats';
// import { useRouter } from 'next/navigation';
// import {
//   FiPlus,
//   FiUsers,
//   FiShield,
//   FiFileText,
//   FiTrendingUp,
//   FiSettings,
//   FiActivity,
//   FiRefreshCw,
//   FiDatabase,
//   FiFlag,
//   FiBarChart2,
// } from 'react-icons/fi';
// import Button from '../../Common/Button';
// import { AnimatedCard } from '@/app/components/animation/AnimatedComponents';

// interface QuickActionsProps {
//   stats: AdminStats | null;
//   onRefresh: () => void;
// }

// export default function QuickActions({ stats, onRefresh }: QuickActionsProps) {
//   const router = useRouter();

//   const actions = [
//     {
//       title: 'Moderar Conteúdo',
//       description: 'Revisar uploads pendentes',
//       icon: FiShield,
//       color: 'from-accent-red to-accent-amber',
//       badge: stats?.moderation?.pendingItems || 0,
//       onClick: () => router.push('/uploads/moderation'),
//       priority: 'high' as const,
//     },
//     {
//       title: 'Gerenciar Usuários',
//       description: 'Administrar contas de usuário',
//       icon: FiUsers,
//       color: 'from-accent-blue to-accent-purple',
//       badge: stats?.engagement.dailyActiveUsers || 0,
//       onClick: () => router.push('/admin/users'),
//       priority: 'medium' as const,
//     },
//     {
//       title: 'Ver Analytics',
//       description: 'Insights e métricas detalhadas',
//       icon: FiTrendingUp,
//       color: 'from-accent-purple to-accent-blue',
//       onClick: () => router.push('/admin/analytics'),
//       priority: 'medium' as const,
//     },
//     {
//       title: 'Reports Pendentes',
//       description: 'Revisar relatórios de usuários',
//       icon: FiFlag,
//       color: 'from-accent-amber to-accent-red',
//       badge: stats?.moderation?.totalReports || 0,
//       onClick: () => router.push('/admin/reports'),
//       priority:
//         stats && stats.moderation && stats.moderation.totalReports > 0
//           ? 'high'
//           : 'low',
//     },
//     {
//       title: 'Monitorar Sistema',
//       description: 'Performance e saúde do sistema',
//       icon: FiActivity,
//       color: 'from-accent-green to-accent-blue',
//       onClick: () => router.push('/admin/system'),
//       priority: 'low' as const,
//     },
//     {
//       title: 'Gerenciar Conteúdo',
//       description: 'Compositores, obras e partituras',
//       icon: FiDatabase,
//       color: 'from-accent-green to-accent-purple',
//       badge: stats
//         ? stats.overview.totalWorks + stats.overview.totalComposers
//         : 0,
//       onClick: () => router.push('/admin/content'),
//       priority: 'medium' as const,
//     },
//     {
//       title: 'Gerar Relatório',
//       description: 'Relatórios personalizados',
//       icon: FiFileText,
//       color: 'from-accent-blue to-accent-green',
//       onClick: () => router.push('/admin/reports/create'),
//       priority: 'low' as const,
//     },
//     {
//       title: 'Configurações',
//       description: 'Ajustar parâmetros do sistema',
//       icon: FiSettings,
//       color: 'from-theme-secondary to-theme-primary',
//       onClick: () => router.push('/admin/settings'),
//       priority: 'low' as const,
//     },
//   ];

//   // Ordenar ações por prioridade
//   const sortedActions = actions.sort((a, b) => {
//     const priorityOrder = { high: 0, medium: 1, low: 2 };
//     return priorityOrder[a.priority] - priorityOrder[b.priority];
//   });

//   const formatBadge = (badge: number): string => {
//     if (badge >= 1000000) return `${(badge / 1000000).toFixed(1)}M`;
//     if (badge >= 1000) return `${(badge / 1000).toFixed(1)}K`;
//     return badge.toString();
//   };

//   const getPriorityColor = (priority: string): string => {
//     switch (priority) {
//       case 'high':
//         return 'border-accent-red/30 shadow-accent-red/10';
//       case 'medium':
//         return 'border-accent-amber/30 shadow-accent-amber/10';
//       default:
//         return 'border-theme-primary/30';
//     }
//   };

//   return (
//     <AnimatedCard className="classical-card p-4 lg:p-6">
//       <div className="space-y-4 lg:space-y-6">
//         {/* Header */}
//         <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
//           <div>
//             <h2 className="text-xl lg:text-2xl font-bold text-theme-primary flex items-center space-x-3">
//               <FiBarChart2 className="w-5 h-5 lg:w-6 lg:h-6 text-accent-blue" />
//               <span>Ações Rápidas</span>
//             </h2>
//             <p className="text-sm text-theme-tertiary mt-1">
//               Acesso rápido às principais funcionalidades administrativas
//             </p>
//           </div>
//           <Button
//             variant="ghost"
//             size="sm"
//             leftIcon={<FiRefreshCw />}
//             onClick={onRefresh}
//             className="w-full sm:w-auto"
//           >
//             Atualizar
//           </Button>
//         </div>

//         {/* Quick Stats Summary */}
//         {stats && (
//           <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 p-4 bg-theme-secondary rounded-xl">
//             <div className="text-center">
//               <div className="text-lg lg:text-xl font-bold text-accent-blue">
//                 {stats.engagement.dailyActiveUsers}
//               </div>
//               <div className="text-xs text-theme-tertiary">Usuários Ativos</div>
//             </div>
//             <div className="text-center">
//               <div className="text-lg lg:text-xl font-bold text-accent-green">
//                 {stats.trends.last7Days.newUploads}
//               </div>
//               <div className="text-xs text-theme-tertiary">Novos Uploads</div>
//             </div>
//             <div className="text-center">
//               <div className="text-lg lg:text-xl font-bold text-accent-amber">
//                 {stats.moderation?.totalReports || 0}
//               </div>
//               <div className="text-xs text-theme-tertiary">Reports</div>
//             </div>
//             <div className="text-center">
//               <div className="text-lg lg:text-xl font-bold text-accent-purple">
//                 {stats.trends.last7Days.newAnnotations}
//               </div>
//               <div className="text-xs text-theme-tertiary">Anotações</div>
//             </div>
//           </div>
//         )}

//         {/* Actions Grid */}
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
//           {sortedActions.map((action, index) => (
//             <button
//               key={index}
//               onClick={action.onClick}
//               className={`group relative p-4 lg:p-6 rounded-xl border-2 transition-all duration-300 hover:scale-105 hover:shadow-lg ${getPriorityColor(
//                 action.priority
//               )} bg-theme-secondary hover:bg-theme-primary/50`}
//             >
//               {/* Priority Indicator */}
//               {action.priority === 'high' && (
//                 <div className="absolute top-2 right-2 w-2 h-2 bg-accent-red rounded-full animate-pulse"></div>
//               )}

//               {/* Icon */}
//               <div
//                 className={`w-10 h-10 lg:w-12 lg:h-12 rounded-2xl bg-gradient-to-br ${action.color} flex items-center justify-center mb-3 lg:mb-4 relative transition-transform group-hover:scale-110`}
//               >
//                 <action.icon className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
//                 {action.badge !== undefined && action.badge > 0 && (
//                   <span className="absolute -top-2 -right-2 min-w-[1.5rem] h-6 bg-accent-red rounded-full text-xs text-white flex items-center justify-center font-bold px-1">
//                     {formatBadge(action.badge)}
//                   </span>
//                 )}
//               </div>

//               {/* Content */}
//               <div className="text-left">
//                 <h3 className="font-bold text-theme-primary mb-2 text-sm lg:text-base group-hover:text-brand-primary transition-colors">
//                   {action.title}
//                 </h3>
//                 <p className="text-xs lg:text-sm text-theme-tertiary group-hover:text-theme-secondary transition-colors">
//                   {action.description}
//                 </p>
//               </div>

//               {/* Hover effect */}
//               <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-brand-primary/10 to-brand-secondary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
//             </button>
//           ))}
//         </div>

//         {/* Additional Quick Actions */}
//         <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-theme-secondary">
//           <Button
//             variant="secondary"
//             size="sm"
//             leftIcon={<FiPlus />}
//             onClick={() => router.push('/admin/content/create')}
//             className="flex-1"
//           >
//             Adicionar Conteúdo
//           </Button>
//           <Button
//             variant="secondary"
//             size="sm"
//             leftIcon={<FiFileText />}
//             onClick={() => router.push('/admin/reports')}
//             className="flex-1"
//           >
//             Ver Todos os Reports
//           </Button>
//           <Button
//             variant="secondary"
//             size="sm"
//             leftIcon={<FiActivity />}
//             onClick={() => router.push('/admin/logs')}
//             className="flex-1"
//           >
//             Logs do Sistema
//           </Button>
//         </div>

//         {/* System Health Indicator */}
//         <div className="flex items-center justify-between p-3 bg-accent-green/10 border border-accent-green/20 rounded-xl">
//           <div className="flex items-center space-x-3">
//             <div className="w-3 h-3 bg-accent-green rounded-full animate-pulse"></div>
//             <span className="text-sm font-medium text-theme-primary">
//               Sistema operando normalmente
//             </span>
//           </div>
//           <div className="text-xs text-theme-tertiary">
//             Última verificação: agora
//           </div>
//         </div>
//       </div>
//     </AnimatedCard>
//   );
// }
