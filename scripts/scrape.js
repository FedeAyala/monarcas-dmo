#!/usr/bin/env node

/**
 * DMO Seals Scraper CLI
 *
 * Uso:
 *   npm run scrape          - Scraping completo desde la wiki
 *   npm run scrape:fallback - Usar datos estáticos de fallback
 */

// Cargar variables de entorno para scripts de Node.js
import "dotenv/config";

import { scrapeAndSave } from "../src/lib/scraper-neon.js";

const args = process.argv.slice(2);

console.log("╔════════════════════════════════════════╗");
console.log("║   DMO Seal Master - Scraper CLI        ║");
console.log("╚════════════════════════════════════════╝\n");

async function main() {
  const startTime = Date.now();

  try {
    await scrapeAndSave();

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`\n⏱️  Tiempo total: ${elapsed}s`);
    console.log(
      '\n💡 Tip: Ahora ejecutá "npm run build" para regenerar el sitio'
    );
  } catch (error) {
    console.error("\n❌ Error:", error.message);
    process.exit(1);
  }
}

main();
