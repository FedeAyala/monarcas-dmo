/**
 * Calculador de niveles de Seals
 * 
 * Calcula los rangos de cada nivel basándose en el max_seals del Digimon.
 * La wiki usa diferentes escalas según el máximo requerido.
 */

// Breakpoints estándar para 3000 seals
const STANDARD_BREAKPOINTS = {
  normal: { min: 1, max: 49 },
  bronze: { min: 50, max: 199 },
  silver: { min: 200, max: 499 },
  gold: { min: 500, max: 999 },
  platinum: { min: 1000, max: 2999 },
  master: { min: 3000, max: 3000 }
};

// Breakpoints para Royal Base Hard (150 seals)
const HARD_BREAKPOINTS = {
  normal: { min: 1, max: 9 },
  bronze: { min: 10, max: 29 },
  silver: { min: 30, max: 49 },
  gold: { min: 50, max: 74 },
  platinum: { min: 75, max: 149 },
  master: { min: 150, max: 150 }
};

// Breakpoints para 200 seals
const MEDIUM_BREAKPOINTS = {
  normal: { min: 1, max: 9 },
  bronze: { min: 10, max: 29 },
  silver: { min: 30, max: 69 },
  gold: { min: 70, max: 119 },
  platinum: { min: 120, max: 199 },
  master: { min: 200, max: 200 }
};

// Breakpoints para 300 seals
const BREAKPOINTS_300 = {
  normal: { min: 1, max: 14 },
  bronze: { min: 15, max: 49 },
  silver: { min: 50, max: 99 },
  gold: { min: 100, max: 179 },
  platinum: { min: 180, max: 299 },
  master: { min: 300, max: 300 }
};

// Breakpoints para 500 seals
const BREAKPOINTS_500 = {
  normal: { min: 1, max: 24 },
  bronze: { min: 25, max: 79 },
  silver: { min: 80, max: 159 },
  gold: { min: 160, max: 299 },
  platinum: { min: 300, max: 499 },
  master: { min: 500, max: 500 }
};

// Breakpoints para 700 seals
const BREAKPOINTS_700 = {
  normal: { min: 1, max: 34 },
  bronze: { min: 35, max: 109 },
  silver: { min: 110, max: 229 },
  gold: { min: 230, max: 419 },
  platinum: { min: 420, max: 699 },
  master: { min: 700, max: 700 }
};

// Breakpoints para 1000 seals
const BREAKPOINTS_1000 = {
  normal: { min: 1, max: 49 },
  bronze: { min: 50, max: 149 },
  silver: { min: 150, max: 329 },
  gold: { min: 330, max: 599 },
  platinum: { min: 600, max: 999 },
  master: { min: 1000, max: 1000 }
};

/**
 * Obtiene los breakpoints para un máximo de seals específico
 */
export function getBreakpoints(maxSeals) {
  switch (maxSeals) {
    case 150:
      return HARD_BREAKPOINTS;
    case 200:
      return MEDIUM_BREAKPOINTS;
    case 300:
      return BREAKPOINTS_300;
    case 500:
      return BREAKPOINTS_500;
    case 700:
      return BREAKPOINTS_700;
    case 1000:
      return BREAKPOINTS_1000;
    case 3000:
    default:
      return STANDARD_BREAKPOINTS;
  }
}

/**
 * Calcula breakpoints proporcionales para cualquier maxSeals
 * Usa interpolación basada en los porcentajes estándar
 */
export function calculateProportionalBreakpoints(maxSeals) {
  // Si hay breakpoints predefinidos, usarlos
  const predefined = [150, 200, 300, 500, 700, 1000, 3000];
  if (predefined.includes(maxSeals)) {
    return getBreakpoints(maxSeals);
  }
  
  // Calcular proporcionalmente
  // Porcentajes basados en 3000:
  // Normal: 0-1.63%, Bronze: 1.67-6.63%, Silver: 6.67-16.63%
  // Gold: 16.67-33.3%, Platinum: 33.33-99.97%, Master: 100%
  
  const pct = (percent) => Math.max(1, Math.round(maxSeals * percent / 100));
  
  return {
    normal: { min: 1, max: pct(1.63) },
    bronze: { min: pct(1.67), max: pct(6.63) },
    silver: { min: pct(6.67), max: pct(16.63) },
    gold: { min: pct(16.67), max: pct(33.3) },
    platinum: { min: pct(33.33), max: maxSeals - 1 },
    master: { min: maxSeals, max: maxSeals }
  };
}

/**
 * Formatea el rango como string
 */
export function formatRange(breakpoint) {
  if (breakpoint.min === breakpoint.max) {
    return `${breakpoint.min}`;
  }
  return `${breakpoint.min}-${breakpoint.max}`;
}

/**
 * Obtiene todos los rangos formateados para un maxSeals
 */
export function getAllRanges(maxSeals) {
  const bp = getBreakpoints(maxSeals);
  
  return {
    normal: formatRange(bp.normal),
    bronze: formatRange(bp.bronze),
    silver: formatRange(bp.silver),
    gold: formatRange(bp.gold),
    platinum: formatRange(bp.platinum),
    master: formatRange(bp.master)
  };
}

/**
 * Calcula el nivel actual basado en la cantidad de seals
 */
export function getCurrentLevel(currentSeals, maxSeals) {
  const bp = getBreakpoints(maxSeals);
  
  if (currentSeals >= bp.master.min) return 'master';
  if (currentSeals >= bp.platinum.min) return 'platinum';
  if (currentSeals >= bp.gold.min) return 'gold';
  if (currentSeals >= bp.silver.min) return 'silver';
  if (currentSeals >= bp.bronze.min) return 'bronze';
  if (currentSeals >= bp.normal.min) return 'normal';
  return 'unopened';
}

/**
 * Calcula cuántos seals faltan para el siguiente nivel
 */
export function getSealsToNextLevel(currentSeals, maxSeals) {
  const bp = getBreakpoints(maxSeals);
  const currentLevel = getCurrentLevel(currentSeals, maxSeals);
  
  const nextLevels = {
    unopened: bp.normal.min,
    normal: bp.bronze.min,
    bronze: bp.silver.min,
    silver: bp.gold.min,
    gold: bp.platinum.min,
    platinum: bp.master.min,
    master: null
  };
  
  const next = nextLevels[currentLevel];
  if (next === null) return 0;
  
  return Math.max(0, next - currentSeals);
}

/**
 * Calcula el progreso porcentual hacia master
 */
export function getProgressToMaster(currentSeals, maxSeals) {
  return Math.min(100, (currentSeals / maxSeals) * 100);
}

// Colores para cada nivel
export const LEVEL_COLORS = {
  unopened: '#6b7280',
  normal: '#a1a1aa',
  bronze: '#cd7f32',
  silver: '#c0c0c0',
  gold: '#ffd700',
  platinum: '#e5e4e2',
  master: '#b19cd9'
};

// Nombres en español
export const LEVEL_NAMES = {
  unopened: 'Sin abrir',
  normal: 'Normal',
  bronze: 'Bronce',
  silver: 'Plata',
  gold: 'Oro',
  platinum: 'Platino',
  master: 'Master'
};
