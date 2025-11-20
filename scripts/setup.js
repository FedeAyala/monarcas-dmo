/**
 * Script de setup para DMO Seals
 * 
 * Uso: npm run setup
 * 
 * Este script inicializa el esquema de la base de datos en Neon
 */

import { initializeSchema } from '../src/lib/neon.js';

async function main() {
  console.log('\n🚀 DMO Seals - Setup\n');
  console.log('═'.repeat(50));

  // Verificar que DATABASE_URL existe
  if (!process.env.DATABASE_URL) {
    console.log('\n❌ Error: DATABASE_URL no está configurada');
    console.log('   Creá un archivo .env con tu connection string de Neon\n');
    process.exit(1);
  }

  try {
    // Inicializar esquema
    console.log('\n📦 Inicializando esquema de base de datos...');
    await initializeSchema();
    console.log('✅ Esquema creado correctamente\n');

    console.log('═'.repeat(50));
    console.log('\n🎉 Setup completado!\n');
    console.log('Próximos pasos:\n');
    console.log('  1. npm run scrape    - Cargar datos desde DMO Wiki');
    console.log('  2. npm run dev       - Iniciar servidor de desarrollo');
    console.log('  3. Visitar /login    - Acceder al panel de admin\n');
    console.log('La contraseña de admin está en tu archivo .env (ADMIN_PASSWORD)\n');

  } catch (error) {
    console.error('\n❌ Error durante el setup:', error.message);
    process.exit(1);
  }
}

main();
