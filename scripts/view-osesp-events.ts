// scripts/view-osesp-events.ts

import { OSESPScraper } from './scrapers/osesp-scraper';

async function main() {
  // ✅ Configura o que coletar
  const scraper = new OSESPScraper({
    includeUpcomingEvents: true, // Eventos próximos
    includeSeason: true, // Temporada 2026
    seasonYear: 2026, // Ano da temporada
  });

  try {
    console.log('🔍 OSESP Event Viewer (Read-Only)\n');
    console.log('='.repeat(60) + '\n');

    const events = await scraper.scrapeEvents();

    console.log('\n' + '='.repeat(60));
    console.log(`\n📊 SUMMARY: Found ${events.length} events\n`);
    console.log('='.repeat(60) + '\n');

    events.forEach((event, index) => {
      console.log(`\n[${index + 1}] ${event.title}`);
      console.log(
        `    📅 Date: ${event.startDate.toLocaleDateString('pt-BR')}`
      );
      console.log(`    ⏰ Time: ${event.startTime || 'N/A'}`);
      console.log(`    🎭 Type: ${event.type}`);
      console.log(`    📍 Venue: ${event.venueDetails || 'Sala São Paulo'}`);
      console.log(
        `    🎼 Composers: ${event.composerNames.join(', ') || 'None detected'}`
      );
      console.log(
        `    🎤 Performers: ${event.performers.slice(0, 3).join(', ') || 'N/A'}`
      );
      console.log(`    🔗 URL: ${event.ticketUrl || 'N/A'}`);
      console.log(
        `    📝 Description: ${event.description.substring(0, 150)}...`
      );
      console.log(`    ---`);
    });

    console.log('\n✨ Preview completed!\n');
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await scraper.cleanup();
  }
}

main();
