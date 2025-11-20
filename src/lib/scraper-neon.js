import * as cheerio from "cheerio";
import { fileURLToPath } from "url";
import { resolve, join, basename } from "path";
import { existsSync, mkdirSync, createWriteStream } from "fs";
import { pipeline } from "stream/promises";
import {
  initializeSchema,
  clearAllData,
  insertCategory,
  insertSeal,
  setLastUpdate,
} from "./neon.js";

const WIKI_URL = "https://dmowiki.com/Seal_Master";
const WIKI_BASE = "https://dmowiki.com";

// Configuración de categorías
const CATEGORY_CONFIG = {
  AT: {
    name: "AT",
    fullName: "Attack Damage",
    description: "Increases normal attack damage",
    icon: "⚔️",
    color: "#ef4444",
    bonuses: {
      unopened: "+0",
      normal: "+10",
      bronze: "+20",
      silver: "+40",
      gold: "+60",
      platinum: "+80",
      master: "+100",
    },
  },
  CT: {
    name: "CT",
    fullName: "Critical Hit Rate",
    description: "Increases critical hit rate",
    icon: "🎯",
    color: "#f59e0b",
    bonuses: {
      unopened: "+0%",
      normal: "+0.1%",
      bronze: "+0.2%",
      silver: "+0.4%",
      gold: "+0.6%",
      platinum: "+0.8%",
      master: "+1%",
    },
  },
  HT: {
    name: "HT",
    fullName: "Hit Rate",
    description: "Increases attack accuracy",
    icon: "🎯",
    color: "#10b981",
    bonuses: {
      unopened: "+0",
      normal: "+10",
      bronze: "+20",
      silver: "+40",
      gold: "+60",
      platinum: "+80",
      master: "+100",
    },
  },
  HP: {
    name: "HP",
    fullName: "Health Points",
    description: "Increases health points",
    icon: "❤️",
    color: "#ec4899",
    bonuses: {
      unopened: "+0",
      normal: "+15",
      bronze: "+30",
      silver: "+60",
      gold: "+90",
      platinum: "+120",
      master: "+150",
    },
  },
  DS: {
    name: "DS",
    fullName: "Digi-Soul Points",
    description: "Increases Digi-Soul points",
    icon: "💎",
    color: "#6366f1",
    bonuses: {
      unopened: "+0",
      normal: "+10",
      bronze: "+20",
      silver: "+40",
      gold: "+60",
      platinum: "+80",
      master: "+100",
    },
  },
  DE: {
    name: "DE",
    fullName: "Defense",
    description: "Increases defense",
    icon: "🛡️",
    color: "#3b82f6",
    bonuses: {
      unopened: "+0",
      normal: "+8",
      bronze: "+16",
      silver: "+32",
      gold: "+48",
      platinum: "+64",
      master: "+80",
    },
  },
  BL: {
    name: "BL",
    fullName: "Block Rate",
    description: "Increases block rate",
    icon: "🔰",
    color: "#14b8a6",
    bonuses: {
      unopened: "+0%",
      normal: "+0.1%",
      bronze: "+0.2%",
      silver: "+0.4%",
      gold: "+0.6%",
      platinum: "+0.8%",
      master: "+1%",
    },
  },
  EV: {
    name: "EV",
    fullName: "Evade Rate",
    description: "Increases evade rate",
    icon: "💨",
    color: "#8b5cf6",
    bonuses: {
      unopened: "+0%",
      normal: "+0.2%",
      bronze: "+0.2%",
      silver: "+0.4%",
      gold: "+0.6%",
      platinum: "+0.8%",
      master: "+1%",
    },
  },
};

async function fetchWikiPage() {
  console.log("📥 Descargando página de la wiki...");

  const response = await fetch(WIKI_URL);
  if (!response.ok) {
    throw new Error(`Error al descargar: ${response.status}`);
  }

  return await response.text();
}

// Directorio para guardar imágenes
const IMAGES_DIR = join(process.cwd(), "public", "images", "seals");

// Función para descargar una imagen
async function downloadImage(url, filename) {
  try {
    // Crear directorio si no existe
    if (!existsSync(IMAGES_DIR)) {
      mkdirSync(IMAGES_DIR, { recursive: true });
    }

    const filepath = join(IMAGES_DIR, filename);

    // Si ya existe, no descargar de nuevo
    if (existsSync(filepath)) {
      return `/images/seals/${filename}`;
    }

    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        Referer: "https://dmowiki.com/",
      },
    });

    if (!response.ok) {
      console.log(`    ⚠️  No se pudo descargar: ${filename}`);
      return null;
    }

    const fileStream = createWriteStream(filepath);
    await pipeline(response.body, fileStream);

    return `/images/seals/${filename}`;
  } catch (error) {
    console.log(`    ⚠️  Error descargando ${filename}: ${error.message}`);
    return null;
  }
}

// Función para procesar todas las imágenes de los seals
async function downloadAllImages(categoriesData) {
  console.log("🖼️  Descargando imágenes...");

  let downloaded = 0;
  let skipped = 0;
  let failed = 0;

  for (const category of categoriesData) {
    for (const seal of category.seals) {
      if (seal.imageUrl) {
        // Generar nombre de archivo seguro
        const urlParts = seal.imageUrl.split("/");
        const originalFilename = urlParts[urlParts.length - 1];
        const safeName = originalFilename.replace(/[^a-zA-Z0-9._-]/g, "_");

        const localPath = await downloadImage(seal.imageUrl, safeName);

        if (localPath) {
          seal.imageUrl = localPath;
          if (localPath.includes("seals/")) {
            downloaded++;
          } else {
            skipped++;
          }
        } else {
          seal.imageUrl = null;
          failed++;
        }
      }
    }
  }

  console.log(
    `    ✓ Descargadas: ${downloaded}, Ya existían: ${skipped}, Fallidas: ${failed}`
  );
  return categoriesData;
}

function parseWikiContent(html) {
  console.log("🔍 Parseando contenido...");

  const $ = cheerio.load(html);
  const categories = {};

  // Inicializar categorías
  Object.keys(CATEGORY_CONFIG).forEach((key) => {
    categories[key] = {
      ...CATEGORY_CONFIG[key],
      id: key.toLowerCase(),
      seals: [],
    };
  });

  // Buscar todas las tablas con clase wikitable
  $("table.wikitable").each((tableIndex, table) => {
    const $table = $(table);

    // Buscar en los th para detectar la categoría
    let currentCategory = null;

    // Buscar en el texto previo a la tabla o en el primer th
    const prevElement = $table.prev();
    const prevText = prevElement.text().trim();
    const headerRow = $table.find("tr").first();
    const headerText = headerRow.text().trim();

    // También buscar en el contenido antes de la tabla
    let searchText = prevText + " " + headerText;

    // Buscar también en el th principal de la tabla
    $table.find("th").each((i, th) => {
      searchText += " " + $(th).text().trim();
    });

    // Intentar detectar la columna que contiene el máximo de seals (ej. "Maximum Seals for Master")
    const headerCols = [];
    const headerRowEls = $table.find("tr").first().find("th");
    headerRowEls.each((i, th) => {
      headerCols.push($(th).text().trim().toLowerCase());
    });
    const maxSealsColIndex = headerCols.findIndex(
      (h) =>
        h.includes("maximum seals") ||
        h.includes("maximum seals for master") ||
        h.includes("max seals")
    );

    // Detectar categoría por el patrón "XX [Nombre]"
    // Importante: buscar en orden específico para evitar confusiones (CT antes que HT)
    const categoryOrder = ["CT", "AT", "HT", "HP", "DS", "DE", "BL", "EV"];

    for (const key of categoryOrder) {
      if (currentCategory) break;

      const config = CATEGORY_CONFIG[key];
      const pattern1 = new RegExp(`\\b${key}\\s*\\[`, "i");
      const pattern2 = new RegExp(`\\b${config.fullName}\\b`, "i");

      if (pattern1.test(searchText) || pattern2.test(searchText)) {
        currentCategory = key;
      }
    }

    if (!currentCategory) {
      const bonusColumns = [
        "Unopened",
        "Normal",
        "Bronze",
        "Silver",
        "Gold",
        "Platinum",
        "Master",
      ];
      const hasAllBonusColumns = bonusColumns.every((col) =>
        searchText.includes(col)
      );
      if (hasAllBonusColumns) {
        let prevEl = $table.prev();
        for (let i = 0; i < 5 && !currentCategory; i++) {
          const txt = prevEl.text().trim();
          Object.keys(CATEGORY_CONFIG).forEach((key) => {
            if (txt.includes(`${key} [`)) {
              currentCategory = key;
            }
          });
          prevEl = prevEl.prev();
        }
      }
    }

    if (!currentCategory) return;

    console.log(`  📋 Encontrada tabla de ${currentCategory}`);

    let rowsProcessed = 0;
    let sealsFound = 0;

    // Variables para manejar rowspan de bonuses
    let currentBonuses = CATEGORY_CONFIG[currentCategory]?.bonuses || {
      unopened: "+0",
      normal: "+0",
      bronze: "+0",
      silver: "+0",
      gold: "+0",
      platinum: "+0",
      master: "+0",
    };
    let bonusRowsRemaining = 0;

    // Parsear filas de datos
    $table.find("tr").each((rowIndex, row) => {
      const $row = $(row);
      const cells = $row.find("td");
      const headerCells = $row.find('th[scope="row"]');

      // Si no hay celdas td, no es una fila de datos
      if (cells.length === 0 && headerCells.length === 0) return;

      rowsProcessed++;

      // Verificar si esta fila tiene celdas de bonuses (th con scope="row")
      if (headerCells.length >= 7) {
        const firstCell = $(headerCells[0]);
        const rowspan = parseInt(firstCell.attr("rowspan")) || 1;

        // Extraer bonuses de las celdas th
        currentBonuses = {
          unopened: $(headerCells[0]).text().trim() || "+0",
          normal: $(headerCells[1]).text().trim() || "+0",
          bronze: $(headerCells[2]).text().trim() || "+0",
          silver: $(headerCells[3]).text().trim() || "+0",
          gold: $(headerCells[4]).text().trim() || "+0",
          platinum: $(headerCells[5]).text().trim() || "+0",
          master: $(headerCells[6]).text().trim() || "+0",
        };
        bonusRowsRemaining = rowspan - 1;

        if (rowsProcessed <= 3) {
          console.log(
            `    Bonuses: ${currentBonuses.unopened}, ${currentBonuses.normal}, ..., ${currentBonuses.master} (rowspan: ${rowspan})`
          );
        }
      } else if (bonusRowsRemaining > 0) {
        bonusRowsRemaining--;
      }

      // Buscar imagen del Digimon: aceptar src, data-src o srcset y normalizar URL.
      let imageUrl = null;
      $row.find("img").each((i, img) => {
        const $img = $(img);
        let src = $img.attr("src") || $img.attr("data-src") || "";
        // Si hay srcset, tomar la primera URL
        if (!src) {
          const srcset = $img.attr("srcset") || "";
          if (srcset) {
            const parts = srcset.split(",").map((s) => s.trim());
            if (parts.length > 0) {
              // cada parte puede ser "url 1x"; tomar la url
              src = parts[0].split(" ")[0];
            }
          }
        }

        if (!src) return;

        // Evitar imágenes indicadoras o sprites que no correspondan al icono de seal
        const lower = src.toLowerCase();
        if (
          lower.includes("blank") ||
          lower.includes("noimage") ||
          lower.includes("spacer")
        )
          return;

        // Normalizar esquemas protocol-relative y rutas relativas
        if (src.startsWith("//")) {
          src = "https:" + src;
        } else if (src.startsWith("/")) {
          src = WIKI_BASE + src;
        } else if (!src.startsWith("http")) {
          // casos relativos sin barra
          src = WIKI_BASE + "/" + src;
        }

        // Aceptar la primera imagen válida
        if (!imageUrl) imageUrl = src;
      });

      // Buscar nombre del Digimon - primero en enlaces, luego en texto
      let name = null;
      let locations = [];

      // Buscar en enlaces
      $row.find("a").each((i, link) => {
        const $link = $(link);
        const href = $link.attr("href") || "";
        const text = $link.text().trim();

        if (!text || text.length < 2) return;
        if (href.includes("images") || href.includes("File:")) return;

        if (
          !name &&
          !href.includes("Seal") &&
          !href.includes("Monster_Card") &&
          !href.includes("Random_Pack") &&
          !text.includes("Seal") &&
          !text.includes("Monster Card")
        ) {
          name = text;
        } else if (name && text !== name) {
          let location = text
            .replace(/\(pick up\)/gi, "")
            .replace(/\(raid box\)/gi, "")
            .replace(/\(raid reward\)/gi, "")
            .replace(/\(rank \d+ only\)/gi, "")
            .trim();

          if (
            location &&
            !locations.includes(location) &&
            !location.includes("Icon") &&
            location.length > 2
          ) {
            locations.push(location);
          }
        }
      });

      // Si no encontramos nombre en enlaces, buscar en el texto de las celdas
      // Esto captura seals como "Passionate", "Environment", etc.
      if (!name && cells.length > 0) {
        // La celda del nombre suele ser la 9na (índice 1 después de la imagen)
        // o podemos buscar en todas las celdas
        cells.each((i, cell) => {
          if (name) return;
          const cellText = $(cell).text().trim();
          // Si la celda tiene texto y no tiene enlaces, podría ser el nombre
          if (
            cellText &&
            cellText.length >= 3 &&
            cellText.length <= 50 &&
            !cellText.includes("+") &&
            !cellText.includes("%") &&
            !cellText.match(/^\d+$/) &&
            $(cell).find("a").length === 0 &&
            $(cell).find("img").length === 0
          ) {
            // Verificar que no sea una ubicación conocida
            if (
              !cellText.includes("Event") &&
              !cellText.includes("Unknown") &&
              !cellText.includes("Seal")
            ) {
              name = cellText;
            }
          }
        });
      }

      if (!name || name.length < 2) return;

      sealsFound++;

      // Determinar max seals: preferir la columna específica si existe
      let maxSeals = 3000;
      const rowText = $row.text().toLowerCase();

      if (maxSealsColIndex !== -1) {
        // Tomar la celda correspondiente (considerando tanto th como td en la fila)
        const allCells = $row.children("th, td");
        const cell = allCells.eq(maxSealsColIndex);
        const cellText = (cell.text() || "").trim();
        if (cellText) {
          const m = cellText.match(/([\d,]{2,6})/);
          if (m && m[1]) {
            const parsed = parseInt(m[1].replace(/,/g, ""), 10);
            if (!Number.isNaN(parsed)) {
              maxSeals = parsed;
            }
          }
        }
      }

      // Fallbacks por patrones conocidos si no se detectó nada en la columna
      if (!maxSeals || maxSeals === 3000) {
        if (
          rowText.includes("royal base (hard)") ||
          rowText.includes("150 seal")
        ) {
          maxSeals = 150;
        } else if (rowText.includes("200 seal")) {
          maxSeals = 200;
        } else if (rowText.includes("300 seal")) {
          maxSeals = 300;
        } else if (rowText.includes("500 seal")) {
          maxSeals = 500;
        } else if (rowText.includes("700 seal")) {
          maxSeals = 700;
        } else {
          // Búsqueda más genérica: "1000 seal", "1,000 seal", "Max: 1000"
          const reSeal = /([\d,]{2,6})\s*seal(s)?/i;
          const reMax = /max(?:imum|\s*seals?)?[:\s]*([\d,]{2,6})/i;
          const matched = rowText.match(reSeal) || rowText.match(reMax);
          if (matched && matched[1]) {
            const parsed = parseInt(matched[1].replace(/,/g, ""), 10);
            if (!Number.isNaN(parsed)) {
              maxSeals = parsed;
            }
          }
        }
      }

      // Evitar duplicados
      const existingSeal = categories[currentCategory].seals.find(
        (s) => s.name === name
      );
      if (!existingSeal) {
        categories[currentCategory].seals.push({
          name,
          imageUrl,
          locations: locations.length > 0 ? locations : ["Unknown"],
          maxSeals,
          bonuses: { ...currentBonuses },
        });
      }
    });

    console.log(
      `    Procesadas ${rowsProcessed} filas, encontrados ${sealsFound} seals`
    );
  });

  const result = Object.values(categories).filter(
    (cat) => cat.seals.length > 0
  );
  console.log(`  📊 Total categorías con datos: ${result.length}`);
  result.forEach((cat) => {
    console.log(`    - ${cat.name}: ${cat.seals.length} seals`);
  });

  return result;
}

async function saveToDatabase(categoriesData) {
  console.log("💾 Guardando en base de datos Neon...");

  // Paso 1: Inicializar schema
  console.log("  📋 Inicializando schema...");
  await initializeSchema();

  // Paso 2: Limpiar datos existentes
  console.log("  🗑️  Limpiando datos existentes...");
  await clearAllData();

  // Paso 3: Insertar categorías primero
  console.log("  📁 Insertando categorías...");
  for (const category of categoriesData) {
    try {
      await insertCategory(category);
      console.log(`    ✓ Categoría ${category.id} insertada`);
    } catch (err) {
      console.error(
        `    ❌ Error insertando categoría ${category.id}:`,
        err.message
      );
      throw err;
    }
  }

  // Paso 4: Insertar seals
  console.log("  🦭 Insertando seals...");
  let totalSeals = 0;

  for (const category of categoriesData) {
    let categorySeals = 0;
    for (const seal of category.seals) {
      try {
        await insertSeal(category.id, seal);
        totalSeals++;
        categorySeals++;
      } catch (err) {
        console.error(
          `    ❌ Error insertando seal "${seal.name}" en ${category.id}:`,
          err.message
        );
        throw err;
      }
    }
    console.log(`    ✓ ${category.name}: ${categorySeals} seals`);
  }

  await setLastUpdate();

  console.log(
    `\n✅ Total: ${totalSeals} seals guardados en ${categoriesData.length} categorías`
  );
}

// Función principal de scraping
export async function scrapeAndSave() {
  try {
    const html = await fetchWikiPage();
    let categoriesData = parseWikiContent(html);

    if (categoriesData.length === 0) {
      console.log("⚠️  No se encontraron datos, usando datos de fallback...");
      await useFallbackData();
      return;
    }

    // Descargar imágenes localmente
    categoriesData = await downloadAllImages(categoriesData);

    await saveToDatabase(categoriesData);
  } catch (error) {
    console.error("❌ Error durante el scraping:", error.message);
    console.log("⚠️  Usando datos de fallback...");
    await useFallbackData();
  }
}

// Datos de fallback
async function useFallbackData() {
  const { sealCategories } = await import("../data/seals.js");

  console.log("  📋 Inicializando schema para fallback...");
  await initializeSchema();

  console.log("  🗑️  Limpiando datos existentes...");
  await clearAllData();

  // Paso 1: Insertar todas las categorías primero
  console.log("  📁 Insertando categorías de fallback...");
  for (const category of sealCategories) {
    try {
      await insertCategory(category);
    } catch (err) {
      console.error(
        `    ❌ Error insertando categoría ${category.id}:`,
        err.message
      );
      throw err;
    }
  }

  // Paso 2: Insertar todos los seals
  console.log("  🦭 Insertando seals de fallback...");
  let totalSeals = 0;
  for (const category of sealCategories) {
    for (const seal of category.seals) {
      try {
        await insertSeal(category.id, {
          name: seal.name,
          imageUrl: null,
          locations: seal.locations,
          maxSeals: seal.maxSeals,
          // Usar bonuses individuales del seal si existen, sino usar los de la categoría
          bonuses: seal.bonuses || category.bonuses,
        });
        totalSeals++;
      } catch (err) {
        console.error(
          `    ❌ Error insertando seal "${seal.name}" en ${category.id}:`,
          err.message
        );
        throw err;
      }
    }
  }

  await setLastUpdate();

  console.log(
    `✅ Datos de fallback cargados: ${totalSeals} seals en ${sealCategories.length} categorías`
  );
}

// Ejecutar si se llama directamente (solo scraper-neon.js, no cuando es importado)
const __filename = fileURLToPath(import.meta.url);
const isDirectExecution =
  process.argv[1] && resolve(process.argv[1]) === __filename;

if (isDirectExecution) {
  console.log("🚀 Iniciando scraping de DMO Wiki...\n");
  scrapeAndSave()
    .then(() => {
      console.log("\n🎉 Proceso completado!");
      process.exit(0);
    })
    .catch((err) => {
      console.error("Error fatal:", err);
      process.exit(1);
    });
}

export { fetchWikiPage, parseWikiContent, saveToDatabase };
