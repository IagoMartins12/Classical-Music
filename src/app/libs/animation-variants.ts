// // libs/animation-variants.ts - Sistema de variantes reutilizáveis
// import { Variants } from 'framer-motion';

// // Configurações base
// export const ANIMATION_CONFIG = {
//   stagger: {
//     fast: 0.05,
//     normal: 0.1,
//     slow: 0.15,
//   },
//   duration: {
//     fast: 0.3,
//     normal: 0.5,
//     slow: 0.8,
//   },
//   spring: {
//     smooth: { stiffness: 100, damping: 15, mass: 1 },
//     bouncy: { stiffness: 300, damping: 20, mass: 1 },
//     gentle: { stiffness: 80, damping: 25, mass: 1 },
//   },
// } as const;

// // Factory para criar variantes de container
// export const createContainerVariants = (
//   staggerSpeed: keyof typeof ANIMATION_CONFIG.stagger = 'normal',
//   delay: number = 0.1
// ): Variants => ({
//   hidden: { opacity: 0 },
//   visible: {
//     opacity: 1,
//     transition: {
//       staggerChildren: ANIMATION_CONFIG.stagger[staggerSpeed],
//       delayChildren: delay,
//     },
//   },
// });

// // Factory para criar variantes de item
// export const createItemVariants = (
//   direction: 'up' | 'down' | 'left' | 'right' | 'scale' = 'up',
//   springType: keyof typeof ANIMATION_CONFIG.spring = 'smooth'
// ): Variants => {
//   const baseHidden = { opacity: 0 };
//   const baseVisible = { opacity: 1 };

//   const directionMap = {
//     up: { y: 20 },
//     down: { y: -20 },
//     left: { x: -20 },
//     right: { x: 20 },
//     scale: { scale: 0.95 },
//   };

//   const resetMap = {
//     up: { y: 0 },
//     down: { y: 0 },
//     left: { x: 0 },
//     right: { x: 0 },
//     scale: { scale: 1 },
//   };

//   return {
//     hidden: { ...baseHidden, ...directionMap[direction] },
//     visible: {
//       ...baseVisible,
//       ...resetMap[direction],
//       transition: {
//         type: 'spring',
//         ...ANIMATION_CONFIG.spring[springType],
//       },
//     },
//   };
// };

// // Variantes pré-definidas mais usadas
// export const containerVariants = createContainerVariants();
// export const fastStaggerContainer = createContainerVariants('fast');
// export const slowStaggerContainer = createContainerVariants('slow');

// export const itemVariants = createItemVariants('up');
// export const cardVariants = createItemVariants('scale', 'bouncy');
// export const slideLeftVariants = createItemVariants('left');
// export const slideRightVariants = createItemVariants('right');

// // Variantes para skeleton/loading
// export const skeletonShimmer: Variants = {
//   hidden: { backgroundPosition: '-200% 0' },
//   visible: {
//     backgroundPosition: '200% 0',
//     transition: {
//       duration: 2,
//       repeat: Infinity,
//       ease: 'linear',
//     },
//   },
// };

// export const skeletonPulse: Variants = {
//   hidden: { opacity: 0.6 },
//   visible: {
//     opacity: [0.6, 1, 0.6],
//     transition: {
//       duration: 1.5,
//       repeat: Infinity,
//       ease: 'easeInOut',
//     },
//   },
// };

// // Variantes para hover effects - CORRIGIDO
// export const hoverVariants: Record<string, { hover?: any; tap?: any }> = {
//   scale: {
//     hover: { scale: 1.05, transition: { duration: 0.2 } },
//     tap: { scale: 0.95 },
//   },
//   lift: {
//     hover: { y: -5, scale: 1.02, transition: { duration: 0.2 } },
//     tap: { y: 0, scale: 0.98 },
//   },
//   glow: {
//     hover: {
//       boxShadow: '0 10px 30px rgba(212, 175, 55, 0.3)',
//       transition: { duration: 0.2 },
//     },
//     tap: { scale: 0.98 },
//   },
//   none: {}, // Adicionado para resolver o erro
// };

// // Variantes para floating elements
// export const floatingVariants: Variants = {
//   hidden: { opacity: 0 },
//   visible: {
//     opacity: [0.3, 0.7, 0.3],
//     y: [0, -10, 0],
//     transition: {
//       duration: 6,
//       repeat: Infinity,
//       ease: 'easeInOut',
//     },
//   },
// };

// // Variantes para header/hero sections
// export const heroVariants: Variants = {
//   hidden: { opacity: 0, y: 30 },
//   visible: {
//     opacity: 1,
//     y: 0,
//     transition: {
//       duration: 0.8,
//       ease: 'easeOut',
//     },
//   },
// };

// // Variantes para modais
// export const modalVariants: Variants = {
//   hidden: { opacity: 0, scale: 0.95 },
//   visible: {
//     opacity: 1,
//     scale: 1,
//     transition: {
//       duration: 0.3,
//       ease: 'easeOut',
//     },
//   },
//   exit: {
//     opacity: 0,
//     scale: 0.95,
//     transition: {
//       duration: 0.2,
//       ease: 'easeIn',
//     },
//   },
// };

// // Variantes para listas
// export const listVariants: Variants = {
//   hidden: { opacity: 0 },
//   visible: {
//     opacity: 1,
//     transition: {
//       staggerChildren: 0.1,
//     },
//   },
// };

// export const listItemVariants: Variants = {
//   hidden: { opacity: 0, x: -20 },
//   visible: {
//     opacity: 1,
//     x: 0,
//     transition: {
//       duration: 0.4,
//       ease: 'easeOut',
//     },
//   },
// };

// // Variantes para navegação
// export const navVariants: Variants = {
//   hidden: { opacity: 0, y: -10 },
//   visible: {
//     opacity: 1,
//     y: 0,
//     transition: {
//       duration: 0.3,
//       ease: 'easeOut',
//     },
//   },
// };

// // Variantes para páginas
// export const pageVariants: Variants = {
//   initial: { opacity: 0, y: 20 },
//   in: { opacity: 1, y: 0 },
//   out: { opacity: 0, y: -20 },
// };

// export const pageTransition = {
//   type: 'tween',
//   ease: 'anticipate',
//   duration: 0.5,
// };
