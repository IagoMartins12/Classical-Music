// scripts/populateTranslations.js (executar no desenvolvimento)
// Comando: node scripts/populateTranslations.js

const fs = require('fs');
const path = require('path');

// Configuração
const GOOGLE_TRANSLATE_API_KEY = process.env.GOOGLE_TRANSLATE_API_KEY; // Se tiver
const SOURCE_LANG = 'pt';
const TARGET_LANGS = ['en'];
const TRANSLATIONS_DIR = path.join(process.cwd(), 'public', 'translations');

// Fallback gratuito usando web scraping (sem API key)
async function translateWithFreeGoogle(text, sourceLang, targetLang) {
  try {
    // Método 1: Usando translate.googleapis.com (limitado mas funciona)
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&q=${encodeURIComponent(
      text
    )}`;

    const response = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    // Parse da resposta do Google Translate
    if (data && data[0] && data[0][0] && data[0][0][0]) {
      return data[0][0][0];
    }

    throw new Error('Resposta inválida do Google Translate');
  } catch (error) {
    console.warn(`Tradução falhou para "${text}": ${error.message}`);
    return text; // Fallback para texto original
  }
}

// Tradução com API oficial (se disponível)
async function translateWithAPI(text, sourceLang, targetLang) {
  if (!GOOGLE_TRANSLATE_API_KEY) {
    return translateWithFreeGoogle(text, sourceLang, targetLang);
  }

  try {
    const response = await fetch(
      `https://translation.googleapis.com/language/translate/v2?key=${GOOGLE_TRANSLATE_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: text,
          source: sourceLang,
          target: targetLang,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return data.data.translations[0].translatedText;
  } catch (error) {
    console.warn(`API translation failed, using free method: ${error.message}`);
    return translateWithFreeGoogle(text, sourceLang, targetLang);
  }
}

// Rate limiting para não sobrecarregar
async function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Função principal
async function populateTranslations() {
  console.log('🌍 Iniciando população de traduções...');

  // Garantir que diretório existe
  if (!fs.existsSync(TRANSLATIONS_DIR)) {
    fs.mkdirSync(TRANSLATIONS_DIR, { recursive: true });
  }

  // Carregar arquivo fonte (português)
  const sourcePath = path.join(TRANSLATIONS_DIR, `${SOURCE_LANG}.json`);

  if (!fs.existsSync(sourcePath)) {
    console.error(`❌ Arquivo fonte não encontrado: ${sourcePath}`);
    process.exit(1);
  }

  const sourceTranslations = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));
  const sourceKeys = Object.keys(sourceTranslations);

  console.log(`📖 Carregadas ${sourceKeys.length} chaves do arquivo fonte`);

  // Processar cada idioma alvo
  for (const targetLang of TARGET_LANGS) {
    console.log(`\n🔄 Processando ${targetLang.toUpperCase()}...`);

    const targetPath = path.join(TRANSLATIONS_DIR, `${targetLang}.json`);

    // Carregar traduções existentes (se houver)
    let existingTranslations = {};
    if (fs.existsSync(targetPath)) {
      existingTranslations = JSON.parse(fs.readFileSync(targetPath, 'utf8'));
      console.log(
        `📝 Encontradas ${
          Object.keys(existingTranslations).length
        } traduções existentes`
      );
    }

    const newTranslations = { ...existingTranslations };
    let translatedCount = 0;
    let skippedCount = 0;

    // Traduzir cada chave
    for (let i = 0; i < sourceKeys.length; i++) {
      const key = sourceKeys[i];
      const sourceText = sourceTranslations[key];

      // Pular se já traduzido
      if (newTranslations[key]) {
        skippedCount++;
        continue;
      }

      // Log de progresso
      console.log(`[${i + 1}/${sourceKeys.length}] Traduzindo: ${key}`);

      try {
        const translatedText = await translateWithAPI(
          sourceText,
          SOURCE_LANG,
          targetLang
        );
        newTranslations[key] = translatedText;
        translatedCount++;

        // Rate limiting: aguardar entre traduções
        await delay(100); // 100ms entre requests
      } catch (error) {
        console.error(`❌ Erro ao traduzir "${key}": ${error.message}`);
        newTranslations[key] = sourceText; // Fallback para texto original
      }
    }

    // Salvar arquivo atualizado
    fs.writeFileSync(
      targetPath,
      JSON.stringify(newTranslations, null, 2),
      'utf8'
    );

    console.log(`✅ ${targetLang.toUpperCase()} concluído:`);
    console.log(`   - ${translatedCount} novas traduções`);
    console.log(`   - ${skippedCount} traduções mantidas`);
    console.log(`   - Total: ${Object.keys(newTranslations).length} chaves`);
  }

  console.log('\n🎉 População de traduções concluída!');
}

// Executar se chamado diretamente
if (require.main === module) {
  populateTranslations().catch(console.error);
}

module.exports = { populateTranslations };
