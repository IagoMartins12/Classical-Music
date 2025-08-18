// // app/api/translate/route.ts
// import { NextRequest, NextResponse } from 'next/server';

// // Cache simples para evitar requests duplicados
// const translationCache = new Map<string, { translation: string; timestamp: number }>();
// const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 horas

// // Rate limiting
// const requestCounts = new Map<string, { count: number; resetTime: number }>();
// const RATE_LIMIT = 50; // 50 requests por hora por IP
// const RATE_WINDOW = 60 * 60 * 1000; // 1 hora

// function getRateLimitKey(request: NextRequest): string {
//   return request.ip || request.headers.get('x-forwarded-for') || 'unknown';
// }

// function checkRateLimit(key: string): boolean {
//   const now = Date.now();
//   const record = requestCounts.get(key);

//   if (!record || now > record.resetTime) {
//     requestCounts.set(key, { count: 1, resetTime: now + RATE_WINDOW });
//     return true;
//   }

//   if (record.count >= RATE_LIMIT) {
//     return false;
//   }

//   record.count++;
//   return true;
// }

// export async function POST(request: NextRequest) {
//   try {
//     // Rate limiting
//     const rateLimitKey = getRateLimitKey(request);
//     if (!checkRateLimit(rateLimitKey)) {
//       return NextResponse.json(
//         { success: false, error: 'Rate limit exceeded' },
//         { status: 429 }
//       );
//     }

//     const { text, from, to } = await request.json();

//     // Validação
//     if (!text || !from || !to) {
//       return NextResponse.json(
//         { success: false, error: 'Missing required parameters' },
//         { status: 400 }
//       );
//     }

//     if (text.length > 5000) {
//       return NextResponse.json(
//         { success: false, error: 'Text too long (max 5000 characters)' },
//         { status: 400 }
//       );
//     }

//     // Verificar cache
//     const cacheKey = `${text}_${from}_${to}`;
//     const cached = translationCache.get(cacheKey);

//     if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
//       return NextResponse.json({
//         success: true,
//         translatedText: cached.translation,
//         fromCache: true,
//       });
//     }

//     // Se idiomas são iguais, retornar texto original
//     if (from === to) {
//       return NextResponse.json({
//         success: true,
//         translatedText: text,
//       });
//     }

//     // Tentar Google Translate gratuito
//     let translatedText: string;

//     try {
//       translatedText = await translateWithGoogleFree(text, from, to);
//     } catch (error) {
//       console.error('Google Translate falhou:', error);

//       // Fallback: retornar texto original
//       return NextResponse.json({
//         success: true,
//         translatedText: text,
//         fallback: true,
//         warning: 'Translation service unavailable, returning original text',
//       });
//     }

//     // Cachear resultado
//     translationCache.set(cacheKey, {
//       translation: translatedText,
//       timestamp: Date.now(),
//     });

//     // Limpar cache antigo periodicamente
//     if (translationCache.size > 1000) {
//       cleanOldCache();
//     }

//     return NextResponse.json({
//       success: true,
//       translatedText,
//     });

//   } catch (error) {
//     console.error('Translation API error:', error);
//     return NextResponse.json(
//       { success: false, error: 'Internal server error' },
//       { status: 500 }
//     );
//   }
// }

// /**
