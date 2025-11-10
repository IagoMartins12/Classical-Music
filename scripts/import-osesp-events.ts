// scripts/import-osesp-events.ts

/**
 * Script para IMPORTAR eventos da OSESP para o banco de dados
 * Uso: npx ts-node scripts/import-osesp-events.ts
 */

import { OSESPScraper } from './scrapers/osesp-scraper';
import { findMultipleComposers } from './utils/composer-matcher';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function askQuestion(query: string): Promise<string> {
  return new Promise((resolve) => rl.question(query, resolve));
}

async function main() {
  const scraper = new OSESPScraper();

  try {
    console.log('💾 OSESP Event Importer\n');
    console.log('='.repeat(60) + '\n');

    // Confirma execução
    const confirm = await askQuestion(
      '⚠️  This will save events to the database. Continue? (yes/no): '
    );

    if (confirm.toLowerCase() !== 'yes') {
      console.log('❌ Import cancelled.');
      process.exit(0);
    }

    console.log('\n🚀 Starting import...\n');

    // Scrape eventos
    const events = await scraper.scrapeEvents();

    if (events.length === 0) {
      console.log('⚠️  No events found to import.');
      process.exit(0);
    }

    console.log(`\n📦 Processing ${events.length} events...\n`);

    // Busca venue
    const venueId = await scraper['getOrCreateVenue']();
    let savedCount = 0;

    // Salva cada evento
    for (const event of events) {
      try {
        // Busca compositores
        const composerIds = await findMultipleComposers(event.composerNames);

        if (composerIds.length > 0) {
          console.log(
            `   🎼 Matched ${composerIds.length} composer(s) for "${event.title}"`
          );
        }

        // Salva evento
        await scraper['saveEvent'](event, venueId, composerIds);
        savedCount++;
      } catch (error: any) {
        console.error(`   ❌ Failed to save "${event.title}":`, error.message);
      }
    }

    // Salva log
    await scraper['saveScrapingLog'](venueId, savedCount);

    console.log('\n' + '='.repeat(60));
    console.log(`\n✅ Import completed!`);
    console.log(`   Total events: ${events.length}`);
    console.log(`   Successfully saved: ${savedCount}`);
    console.log(`   Failed: ${events.length - savedCount}\n`);
    console.log('='.repeat(60) + '\n');
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    rl.close();
    await scraper.cleanup();
  }
}

main();
