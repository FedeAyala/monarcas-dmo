import { neon } from "@neondatabase/serverless";

// Configuración de Neon
const getDatabaseUrl = () => {
  // Soportar tanto Astro (import.meta.env) como Node.js (process.env)
  // En Astro SSR, import.meta.env contiene las variables del servidor
  // En Node.js puro, usamos process.env

  const url =
    (typeof import.meta !== "undefined" && import.meta.env?.DATABASE_URL) ||
    process.env.DATABASE_URL;

  if (!url) {
    throw new Error(
      "DATABASE_URL no está configurada. Verificá tu archivo .env"
    );
  }
  return url;
};

// Cliente SQL
let sql = null;

export function getDatabase() {
  if (!sql) {
    sql = neon(getDatabaseUrl());
  }
  return sql;
}

export async function initializeSchema() {
  const sql = getDatabase();

  // Tabla de categorías de seals
  await sql`
    CREATE TABLE IF NOT EXISTS seal_categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      full_name TEXT NOT NULL,
      description TEXT,
      icon TEXT,
      color TEXT,
      bonus_unopened TEXT,
      bonus_normal TEXT,
      bonus_bronze TEXT,
      bonus_silver TEXT,
      bonus_gold TEXT,
      bonus_platinum TEXT,
      bonus_master TEXT,
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `;

  // Tabla de seals individuales
  await sql`
    CREATE TABLE IF NOT EXISTS seals (
      id SERIAL PRIMARY KEY,
      category_id TEXT NOT NULL REFERENCES seal_categories(id),
      name TEXT NOT NULL,
      image_url TEXT,
      max_seals INTEGER DEFAULT 3000,
      bonus_unopened TEXT,
      bonus_normal TEXT,
      bonus_bronze TEXT,
      bonus_silver TEXT,
      bonus_gold TEXT,
      bonus_platinum TEXT,
      bonus_master TEXT,
      updated_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(category_id, name)
    )
  `;

  // Tabla de ubicaciones
  await sql`
    CREATE TABLE IF NOT EXISTS seal_locations (
      id SERIAL PRIMARY KEY,
      seal_id INTEGER NOT NULL REFERENCES seals(id) ON DELETE CASCADE,
      location TEXT NOT NULL,
      UNIQUE(seal_id, location)
    )
  `;

  // Tabla de metadata
  await sql`
    CREATE TABLE IF NOT EXISTS metadata (
      key TEXT PRIMARY KEY,
      value TEXT,
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `;

  // Tabla de logs de scraping
  await sql`
    CREATE TABLE IF NOT EXISTS scrape_logs (
      id SERIAL PRIMARY KEY,
      started_at TIMESTAMP DEFAULT NOW(),
      finished_at TIMESTAMP,
      status TEXT DEFAULT 'running',
      seals_count INTEGER,
      error_message TEXT
    )
  `;

  // Índices
  await sql`CREATE INDEX IF NOT EXISTS idx_seals_category ON seals(category_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_locations_seal ON seal_locations(seal_id)`;
}

// ==================== SCRAPE LOG FUNCTIONS ====================

export async function createScrapeLog() {
  const sql = getDatabase();
  const result = await sql`
    INSERT INTO scrape_logs (status) VALUES ('running')
    RETURNING id
  `;
  return result[0]?.id;
}

export async function updateScrapeLog(id, status, sealsCount, errorMessage) {
  const sql = getDatabase();
  await sql`
    UPDATE scrape_logs 
    SET finished_at = NOW(), 
        status = ${status}, 
        seals_count = ${sealsCount || null},
        error_message = ${errorMessage || null}
    WHERE id = ${id}
  `;
}

export async function getScrapeLogs(limit = 10) {
  const sql = getDatabase();
  const result = await sql`
    SELECT * FROM scrape_logs ORDER BY started_at DESC LIMIT ${limit}
  `;
  return result;
}

// ==================== SEAL FUNCTIONS ====================

export async function getAllCategories() {
  const sql = getDatabase();
  const result = await sql`
    SELECT * FROM seal_categories ORDER BY name
  `;
  return result;
}

export async function getSealsByCategory(categoryId) {
  const sql = getDatabase();
  const result = await sql`
    SELECT s.*, STRING_AGG(sl.location, '||') as locations
    FROM seals s
    LEFT JOIN seal_locations sl ON s.id = sl.seal_id
    WHERE s.category_id = ${categoryId}
    GROUP BY s.id
    ORDER BY s.name
  `;

  const seals = result.map((seal) => ({
    id: seal.id,
    name: seal.name,
    imageUrl: seal.image_url,
    maxSeals: seal.max_seals,
    locations: seal.locations ? String(seal.locations).split("||") : [],
    bonuses: {
      unopened: seal.bonus_unopened || "+0",
      normal: seal.bonus_normal || "+0",
      bronze: seal.bonus_bronze || "+0",
      silver: seal.bonus_silver || "+0",
      gold: seal.bonus_gold || "+0",
      platinum: seal.bonus_platinum || "+0",
      master: seal.bonus_master || "+0",
    },
  }));

  // Debug: mostrar algunos seals para verificar
  if (seals.length > 0 && categoryId === "at") {
    const metalGreymon = seals.find((s) => s.name.includes("MetalGreymon"));
    if (metalGreymon) {
      console.log(
        `🔍 Debug MetalGreymon bonuses from DB:`,
        metalGreymon.bonuses
      );
    }
  }

  return seals;
}

export async function getSealById(id) {
  const sql = getDatabase();
  const result = await sql`
    SELECT s.*, sc.name as category_name, sc.color as category_color,
           STRING_AGG(sl.location, '||') as locations
    FROM seals s
    JOIN seal_categories sc ON s.category_id = sc.id
    LEFT JOIN seal_locations sl ON s.id = sl.seal_id
    WHERE s.id = ${id}
    GROUP BY s.id, sc.name, sc.color
  `;

  if (!result[0]) return null;

  const seal = result[0];
  return {
    ...seal,
    locations: seal.locations ? String(seal.locations).split("||") : [],
  };
}

export async function getAllSealsData() {
  const categories = await getAllCategories();

  const result = [];
  for (const cat of categories) {
    const seals = await getSealsByCategory(cat.id);
    result.push({
      id: cat.id,
      name: cat.name,
      fullName: cat.full_name,
      description: cat.description,
      icon: cat.icon,
      color: cat.color,
      bonuses: {
        unopened: cat.bonus_unopened,
        normal: cat.bonus_normal,
        bronze: cat.bonus_bronze,
        silver: cat.bonus_silver,
        gold: cat.bonus_gold,
        platinum: cat.bonus_platinum,
        master: cat.bonus_master,
      },
      seals,
    });
  }

  return result;
}

export async function getSealsCount() {
  const sql = getDatabase();
  const result = await sql`SELECT COUNT(*) as count FROM seals`;
  return result[0]?.count || 0;
}

export async function getLastUpdate() {
  const sql = getDatabase();
  try {
    const result = await sql`
      SELECT value FROM metadata WHERE key = 'last_scrape'
    `;
    return result[0]?.value || null;
  } catch {
    return null;
  }
}

export async function setLastUpdate() {
  const sql = getDatabase();
  await sql`
    INSERT INTO metadata (key, value, updated_at)
    VALUES ('last_scrape', NOW()::text, NOW())
    ON CONFLICT (key) DO UPDATE SET value = NOW()::text, updated_at = NOW()
  `;
}

// Función para limpiar y reinsertar datos
export async function clearAllData() {
  const sql = getDatabase();

  try {
    // Intentar TRUNCATE CASCADE primero (más rápido)
    await sql`TRUNCATE TABLE seal_locations, seals, seal_categories RESTART IDENTITY CASCADE`;
    console.log("  🗑️  Tablas limpiadas con TRUNCATE");
  } catch (truncateError) {
    console.log("  ⚠️  TRUNCATE falló, usando DELETE...");
    // Fallback: DELETE en orden correcto respetando foreign keys
    try {
      await sql`DELETE FROM seal_locations`;
      await sql`DELETE FROM seals`;
      await sql`DELETE FROM seal_categories`;
      console.log("  🗑️  Tablas limpiadas con DELETE");
    } catch (deleteError) {
      console.error("  ❌ Error al limpiar tablas:", deleteError.message);
      throw deleteError;
    }
  }
}

export async function insertCategory(category) {
  const sql = getDatabase();
  await sql`
    INSERT INTO seal_categories 
    (id, name, full_name, description, icon, color, 
     bonus_unopened, bonus_normal, bonus_bronze, bonus_silver, 
     bonus_gold, bonus_platinum, bonus_master)
    VALUES (
      ${category.id},
      ${category.name},
      ${category.fullName},
      ${category.description},
      ${category.icon},
      ${category.color},
      ${category.bonuses.unopened},
      ${category.bonuses.normal},
      ${category.bonuses.bronze},
      ${category.bonuses.silver},
      ${category.bonuses.gold},
      ${category.bonuses.platinum},
      ${category.bonuses.master}
    )
  `;
}

export async function insertSeal(categoryId, seal) {
  const sql = getDatabase();

  const result = await sql`
    INSERT INTO seals (category_id, name, image_url, max_seals,
      bonus_unopened, bonus_normal, bonus_bronze, bonus_silver,
      bonus_gold, bonus_platinum, bonus_master)
    VALUES (
      ${categoryId}, 
      ${seal.name}, 
      ${seal.imageUrl || null}, 
      ${seal.maxSeals},
      ${seal.bonuses?.unopened || null},
      ${seal.bonuses?.normal || null},
      ${seal.bonuses?.bronze || null},
      ${seal.bonuses?.silver || null},
      ${seal.bonuses?.gold || null},
      ${seal.bonuses?.platinum || null},
      ${seal.bonuses?.master || null}
    )
    RETURNING id
  `;

  const sealId = result[0]?.id;

  // Insertar ubicaciones
  for (const location of seal.locations) {
    await sql`
      INSERT INTO seal_locations (seal_id, location)
      VALUES (${sealId}, ${location})
      ON CONFLICT (seal_id, location) DO NOTHING
    `;
  }

  return sealId;
}

// ==================== LOCATION MANAGEMENT FUNCTIONS ====================

// Obtener todas las locaciones de un seal
export async function getLocationsBySealId(sealId) {
  const sql = getDatabase();
  const result = await sql`
    SELECT id, location FROM seal_locations
    WHERE seal_id = ${sealId}
    ORDER BY location
  `;
  return result;
}

// Agregar una nueva locación a un seal
export async function addLocationToSeal(sealId, location) {
  const sql = getDatabase();
  const result = await sql`
    INSERT INTO seal_locations (seal_id, location)
    VALUES (${sealId}, ${location})
    ON CONFLICT (seal_id, location) DO NOTHING
    RETURNING id, location
  `;
  return result[0];
}

// Eliminar una locación específica
export async function deleteLocation(locationId) {
  const sql = getDatabase();
  await sql`
    DELETE FROM seal_locations WHERE id = ${locationId}
  `;
}

// Actualizar una locación
export async function updateLocation(locationId, newLocation) {
  const sql = getDatabase();
  const result = await sql`
    UPDATE seal_locations
    SET location = ${newLocation}
    WHERE id = ${locationId}
    RETURNING id, seal_id, location
  `;
  return result[0];
}

// Buscar todos los seals con sus locaciones (para el admin)
export async function getAllSealsWithLocations() {
  const sql = getDatabase();
  const result = await sql`
    SELECT
      s.id,
      s.name,
      s.category_id,
      sc.name as category_name,
      sc.color as category_color,
      STRING_AGG(sl.location, '||') as locations
    FROM seals s
    JOIN seal_categories sc ON s.category_id = sc.id
    LEFT JOIN seal_locations sl ON s.id = sl.seal_id
    GROUP BY s.id, s.name, s.category_id, sc.name, sc.color
    ORDER BY sc.name, s.name
  `;

  return result.map(seal => ({
    id: seal.id,
    name: seal.name,
    categoryId: seal.category_id,
    categoryName: seal.category_name,
    categoryColor: seal.category_color,
    locations: seal.locations ? String(seal.locations).split("||") : []
  }));
}
