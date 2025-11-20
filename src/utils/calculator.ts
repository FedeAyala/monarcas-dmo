import type { CategoryId, SealLevel, SealRange, SealRanges } from "../types";
import { MAX_BONUSES } from "./constants";

// Breakpoints predefinidos por maxSeals
const BREAKPOINTS_MAP: Record<number, Record<SealLevel, SealRange>> = {
  150: {
    unopened: { min: 0, max: 0 },
    normal: { min: 1, max: 9 },
    bronze: { min: 10, max: 29 },
    silver: { min: 30, max: 49 },
    gold: { min: 50, max: 74 },
    platinum: { min: 75, max: 149 },
    master: { min: 150, max: 150 },
  },
  200: {
    unopened: { min: 0, max: 0 },
    normal: { min: 1, max: 9 },
    bronze: { min: 10, max: 29 },
    silver: { min: 30, max: 69 },
    gold: { min: 70, max: 119 },
    platinum: { min: 120, max: 199 },
    master: { min: 200, max: 200 },
  },
  300: {
    unopened: { min: 0, max: 0 },
    normal: { min: 1, max: 14 },
    bronze: { min: 15, max: 49 },
    silver: { min: 50, max: 99 },
    gold: { min: 100, max: 179 },
    platinum: { min: 180, max: 299 },
    master: { min: 300, max: 300 },
  },
  500: {
    unopened: { min: 0, max: 0 },
    normal: { min: 1, max: 24 },
    bronze: { min: 25, max: 79 },
    silver: { min: 80, max: 159 },
    gold: { min: 160, max: 299 },
    platinum: { min: 300, max: 499 },
    master: { min: 500, max: 500 },
  },
  700: {
    unopened: { min: 0, max: 0 },
    normal: { min: 1, max: 34 },
    bronze: { min: 35, max: 109 },
    silver: { min: 110, max: 229 },
    gold: { min: 230, max: 419 },
    platinum: { min: 420, max: 699 },
    master: { min: 700, max: 700 },
  },
  1000: {
    unopened: { min: 0, max: 0 },
    normal: { min: 1, max: 49 },
    bronze: { min: 50, max: 149 },
    silver: { min: 150, max: 329 },
    gold: { min: 330, max: 599 },
    platinum: { min: 600, max: 999 },
    master: { min: 1000, max: 1000 },
  },
  3000: {
    unopened: { min: 0, max: 0 },
    normal: { min: 1, max: 49 },
    bronze: { min: 50, max: 199 },
    silver: { min: 200, max: 499 },
    gold: { min: 500, max: 999 },
    platinum: { min: 1000, max: 2999 },
    master: { min: 3000, max: 3000 },
  },
};

/**
 * Obtiene los breakpoints para un máximo de seals
 */
export function getBreakpoints(maxSeals: number): Record<SealLevel, SealRange> {
  return BREAKPOINTS_MAP[maxSeals] || BREAKPOINTS_MAP[3000];
}

/**
 * Formatea un rango como string
 */
export function formatRange(range: SealRange): string {
  if (range.min === range.max) {
    return `${range.min}`;
  }
  return `${range.min}-${range.max}`;
}

/**
 * Obtiene todos los rangos formateados
 */
export function getAllRanges(maxSeals: number): SealRanges {
  const bp = getBreakpoints(maxSeals);

  return {
    normal: formatRange(bp.normal),
    bronze: formatRange(bp.bronze),
    silver: formatRange(bp.silver),
    gold: formatRange(bp.gold),
    platinum: formatRange(bp.platinum),
    master: formatRange(bp.master),
  };
}

/**
 * Calcula el nivel actual basado en la cantidad de seals
 */
export function getCurrentLevel(
  currentSeals: number,
  maxSeals: number
): SealLevel {
  const bp = getBreakpoints(maxSeals);

  if (currentSeals >= bp.master.min) return "master";
  if (currentSeals >= bp.platinum.min) return "platinum";
  if (currentSeals >= bp.gold.min) return "gold";
  if (currentSeals >= bp.silver.min) return "silver";
  if (currentSeals >= bp.bronze.min) return "bronze";
  if (currentSeals >= bp.normal.min) return "normal";
  return "unopened";
}

/**
 * Multipliers de bonus por nivel (0 a 1)
 */
const LEVEL_MULTIPLIERS: Record<SealLevel, number> = {
  unopened: 0,
  normal: 0.1,
  bronze: 0.2,
  silver: 0.4,
  gold: 0.6,
  platinum: 0.8,
  master: 1.0,
};

/**
 * Calcula el bonus actual basado en la cantidad de seals
 */
export function calculateBonus(
  currentSeals: number,
  maxSeals: number,
  categoryId: CategoryId,
  overrideMaxBonus?: number
): number {
  const level = getCurrentLevel(currentSeals, maxSeals);
  const maxBonus =
    typeof overrideMaxBonus === "number" && !Number.isNaN(overrideMaxBonus)
      ? overrideMaxBonus
      : MAX_BONUSES[categoryId];
  const multiplier = LEVEL_MULTIPLIERS[level];

  return maxBonus * multiplier;
}

/**
 * Parsea un string de bonus como "+100" o "+0.1%" y devuelve el número (sin el signo ni el %)
 */
export function parseBonusString(bonusStr: string | undefined): number | undefined {
  if (!bonusStr) return undefined;
  const cleaned = String(bonusStr).replace(/[+\s%]/g, "");
  const n = parseFloat(cleaned);
  return Number.isNaN(n) ? undefined : n;
}

/**
 * Calcula el progreso porcentual hacia master
 */
export function getProgressToMaster(
  currentSeals: number,
  maxSeals: number
): number {
  return Math.min(100, (currentSeals / maxSeals) * 100);
}

/**
 * Calcula seals necesarios para el siguiente nivel
 */
export function getSealsToNextLevel(
  currentSeals: number,
  maxSeals: number
): number {
  const bp = getBreakpoints(maxSeals);
  const currentLevel = getCurrentLevel(currentSeals, maxSeals);

  const nextLevelMinSeals: Record<SealLevel, number | null> = {
    unopened: bp.normal.min,
    normal: bp.bronze.min,
    bronze: bp.silver.min,
    silver: bp.gold.min,
    gold: bp.platinum.min,
    platinum: bp.master.min,
    master: null,
  };

  const next = nextLevelMinSeals[currentLevel];
  if (next === null) return 0;

  return Math.max(0, next - currentSeals);
}

/**
 * Formatea un bonus para mostrar
 */
export function formatBonus(value: number, categoryId: CategoryId): string {
  const isPercentage = ["ct", "bl", "ev"].includes(categoryId);

  if (isPercentage) {
    return `+${value.toFixed(1)}%`;
  }
  return `+${Math.round(value)}`;
}

/**
 * Obtiene el color del nivel
 */
export function getLevelColor(level: SealLevel): string {
  const colors: Record<SealLevel, string> = {
    unopened: "#6b7280",
    normal: "#a1a1aa",
    bronze: "#cd7f32",
    silver: "#c0c0c0",
    gold: "#ffd700",
    platinum: "#e5e4e2",
    master: "#b19cd9",
  };

  return colors[level];
}
