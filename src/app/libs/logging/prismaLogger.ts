// // app/libs/logging/prismaLogger.ts
// import { PrismaClient } from '@prisma/client';
// import { systemLogger, LogLevel, LogCategory } from './systemLogger';

// // Extender o Prisma Client com logging
// export function createPrismaWithLogging(): PrismaClient {
//   const prisma = new PrismaClient({
//     log: [
//       { level: 'query', emit: 'event' },
//       { level: 'error', emit: 'event' },
//       { level: 'info', emit: 'event' },
//       { level: 'warn', emit: 'event' },
//     ],
//   });

//   // Map para rastrear queries em execução
//   const queryTracker = new Map<
//     string,
//     {
//       startTime: number;
//       model: string;
//       operation: string;
//       query: string;
//     }
//   >();

//   // Interceptar eventos de query
//   prisma.$on('query', (e: any) => {
//     const queryId = `${Date.now()}-${Math.random().toString(36).substring(2)}`;
//     const startTime = Date.now();

//     // Extrair modelo e operação da query
//     const { model, operation } = parseQuery(e.query);

//     // Registrar início da query
//     queryTracker.set(queryId, {
//       startTime,
//       model,
//       operation,
//       query: e.query,
//     });

//     // Log de trace para debug (apenas em desenvolvimento)
//     if (process.env.NODE_ENV === 'development') {
//       systemLogger.trace(
//         LogCategory.DATABASE,
//         `Query started: ${operation} on ${model}`,
//         {
//           traceId: queryId,
//           query: {
//             model,
//             operation,
//             sql: e.query,
//           },
//         }
//       );
//     }

//     // Simular finalização da query (já que o Prisma não emite evento de fim)
//     setTimeout(() => {
//       const tracked = queryTracker.get(queryId);
//       if (tracked) {
//         const duration = Date.now() - tracked.startTime;

//         systemLogger.logPrismaQuery(
//           tracked.model,
//           tracked.operation,
//           duration,
//           {
//             traceId: queryId,
//             query: {
//               model: tracked.model,
//               operation: tracked.operation,
//               duration,
//               sql:
//                 process.env.NODE_ENV === 'development'
//                   ? tracked.query
//                   : undefined,
//             },
//           }
//         );

//         queryTracker.delete(queryId);
//       }
//     }, e.duration || 1);
//   });

//   // Interceptar erros
//   prisma.$on('error', (e: any) => {
//     systemLogger.error(LogCategory.DATABASE, `Prisma Error: ${e.message}`, {
//       error: {
//         message: e.message,
//         code: e.code,
//       },
//       metadata: {
//         target: e.meta?.target,
//         cause: e.meta?.cause,
//       },
//     });
//   });

//   // Interceptar info e warnings
//   prisma.$on('info', (e: any) => {
//     systemLogger.info(LogCategory.DATABASE, `Prisma Info: ${e.message}`, {
//       metadata: { timestamp: e.timestamp },
//     });
//   });

//   prisma.$on('warn', (e: any) => {
//     systemLogger.warn(LogCategory.DATABASE, `Prisma Warning: ${e.message}`, {
//       metadata: { timestamp: e.timestamp },
//     });
//   });

//   return prisma;
// }

// // Parsear query para extrair modelo e operação
// function parseQuery(query: string): { model: string; operation: string } {
//   // Queries SQL do Prisma geralmente seguem padrões identificáveis
//   const queryLower = query.toLowerCase().trim();

//   let operation = 'unknown';
//   let model = 'unknown';

//   // Identificar operação
//   if (queryLower.startsWith('select')) {
//     operation = 'findMany/findFirst/findUnique';
//   } else if (queryLower.startsWith('insert')) {
//     operation = 'create/createMany';
//   } else if (queryLower.startsWith('update')) {
//     operation = 'update/updateMany';
//   } else if (queryLower.startsWith('delete')) {
//     operation = 'delete/deleteMany';
//   } else if (queryLower.includes('count')) {
//     operation = 'count';
//   }

//   // Tentar extrair nome da tabela/modelo
//   const tableMatch = query.match(
//     /(?:FROM|INTO|UPDATE|DELETE\s+FROM)\s+`?(\w+)`?/i
//   );
//   if (tableMatch) {
//     model = tableMatch[1];

//     // Converter nome da tabela para nome do modelo (convenção Prisma)
//     model = model.charAt(0).toUpperCase() + model.slice(1);

//     // Remover underscore e capitalizar (ex: user_tokens -> UserTokens)
//     model = model.replace(/_(\w)/g, (_, letter) => letter.toUpperCase());
//   }

//   return { model, operation };
// }

// // Middleware personalizado para capturar queries específicas
// export function withQueryLogging<T extends Record<string, any>>(
//   prismaModel: T,
//   modelName: string
// ): T {
//   return new Proxy(prismaModel, {
//     get(target, prop) {
//       const originalMethod = target[String(prop)]; // Convert symbol to string

//       if (typeof originalMethod === 'function') {
//         return async function (...args: any[]) {
//           const startTime = Date.now();
//           const operation = String(prop);
//           const traceId = `${Date.now()}-${Math.random()
//             .toString(36)
//             .substring(2)}`;

//           try {
//             // Log início da operação
//             systemLogger.trace(
//               LogCategory.DATABASE,
//               `${modelName}.${operation} started`,
//               {
//                 traceId,
//                 query: {
//                   model: modelName,
//                   operation,
//                 },
//                 metadata: {
//                   args:
//                     process.env.NODE_ENV === 'development' ? args : undefined,
//                 },
//               }
//             );

//             // Executar método original
//             const result = await originalMethod.apply(target, args);
//             const duration = Date.now() - startTime;

//             // Log sucesso
//             systemLogger.logPrismaQuery(modelName, operation, duration, {
//               traceId,
//               metadata: {
//                 success: true,
//                 resultCount: Array.isArray(result)
//                   ? result.length
//                   : result
//                   ? 1
//                   : 0,
//               },
//             });

//             return result;
//           } catch (error: any) {
//             // Type assertion for error
//             const duration = Date.now() - startTime;

//             // Log erro
//             systemLogger.error(
//               LogCategory.DATABASE,
//               `${modelName}.${operation} failed: ${
//                 error?.message || 'Unknown error'
//               }`,
//               {
//                 traceId,
//                 duration,
//                 query: {
//                   model: modelName,
//                   operation,
//                   duration,
//                 },
//                 error: {
//                   message: error?.message || 'Unknown error',
//                   stack: error?.stack,
//                   code: error?.code,
//                 },
//               }
//             );

//             throw error;
//           }
//         };
//       }

//       return originalMethod;
//     },
//   });
// }

// // Função para analisar performance de queries
// export function analyzeQueryPerformance(
//   queries: Array<{
//     model: string;
//     operation: string;
//     duration: number;
//     timestamp: string;
//   }>
// ): {
//   slowQueries: number;
//   avgDuration: number;
//   topSlowModels: Array<{ model: string; avgDuration: number; count: number }>;
//   topSlowOperations: Array<{
//     operation: string;
//     avgDuration: number;
//     count: number;
//   }>;
//   hourlyStats: Array<{ hour: number; count: number; avgDuration: number }>;
// } {
//   const SLOW_THRESHOLD = 90000; // 1.5 minutos

//   const slowQueries = queries.filter((q) => q.duration > SLOW_THRESHOLD).length;
//   const avgDuration =
//     queries.length > 0
//       ? queries.reduce((sum, q) => sum + q.duration, 0) / queries.length
//       : 0;

//   // Agrupar por modelo
//   const modelStats = new Map<string, { total: number; count: number }>();
//   queries.forEach((q) => {
//     const current = modelStats.get(q.model) || { total: 0, count: 0 };
//     current.total += q.duration;
//     current.count += 1;
//     modelStats.set(q.model, current);
//   });

//   const topSlowModels = Array.from(modelStats.entries())
//     .map(([model, stats]) => ({
//       model,
//       avgDuration: stats.total / stats.count,
//       count: stats.count,
//     }))
//     .sort((a, b) => b.avgDuration - a.avgDuration)
//     .slice(0, 5);

//   // Agrupar por operação
//   const operationStats = new Map<string, { total: number; count: number }>();
//   queries.forEach((q) => {
//     const current = operationStats.get(q.operation) || { total: 0, count: 0 };
//     current.total += q.duration;
//     current.count += 1;
//     operationStats.set(q.operation, current);
//   });

//   const topSlowOperations = Array.from(operationStats.entries())
//     .map(([operation, stats]) => ({
//       operation,
//       avgDuration: stats.total / stats.count,
//       count: stats.count,
//     }))
//     .sort((a, b) => b.avgDuration - a.avgDuration)
//     .slice(0, 5);

//   // Estatísticas por hora
//   const hourlyStats = Array.from({ length: 24 }, (_, hour) => {
//     const hourQueries = queries.filter((q) => {
//       const queryHour = new Date(q.timestamp).getHours();
//       return queryHour === hour;
//     });

//     return {
//       hour,
//       count: hourQueries.length,
//       avgDuration:
//         hourQueries.length > 0
//           ? hourQueries.reduce((sum, q) => sum + q.duration, 0) /
//             hourQueries.length
//           : 0,
//     };
//   });

//   return {
//     slowQueries,
//     avgDuration: Math.round(avgDuration),
//     topSlowModels,
//     topSlowOperations,
//     hourlyStats,
//   };
// }

// // Função utilitária para monitorar operações específicas
// export function monitorOperation<T>(
//   operation: () => Promise<T>,
//   operationName: string,
//   model?: string
// ): Promise<T> {
//   return new Promise(async (resolve, reject) => {
//     const startTime = Date.now();
//     const traceId = `${Date.now()}-${Math.random().toString(36).substring(2)}`;

//     try {
//       systemLogger.trace(
//         LogCategory.DATABASE,
//         `Operation started: ${operationName}`,
//         {
//           traceId,
//           metadata: { model },
//         }
//       );

//       const result = await operation();
//       const duration = Date.now() - startTime;

//       systemLogger.info(
//         LogCategory.DATABASE,
//         `Operation completed: ${operationName} (${duration}ms)`,
//         {
//           traceId,
//           duration,
//           metadata: {
//             model,
//             success: true,
//           },
//         }
//       );

//       resolve(result);
//     } catch (error: any) {
//       // Type assertion for error
//       const duration = Date.now() - startTime;

//       systemLogger.error(
//         LogCategory.DATABASE,
//         `Operation failed: ${operationName} (${duration}ms)`,
//         {
//           traceId,
//           duration,
//           error: {
//             message: error?.message || 'Unknown error',
//             stack: error?.stack,
//           },
//           metadata: { model },
//         }
//       );

//       reject(error);
//     }
//   });
// }

// // Criar instância do Prisma com logging
// export const prismaWithLogging = createPrismaWithLogging();
