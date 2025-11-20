// Tipos base para el sistema de Seals

export type SealLevel =
  | "unopened"
  | "normal"
  | "bronze"
  | "silver"
  | "gold"
  | "platinum"
  | "master";

export type CategoryId = "at" | "ct" | "ht" | "hp" | "ds" | "de" | "bl" | "ev";

export interface SealBonuses {
  unopened: string;
  normal: string;
  bronze: string;
  silver: string;
  gold: string;
  platinum: string;
  master: string;
}

export interface Seal {
  id?: number;
  name: string;
  image_url?: string | null;
  imageUrl?: string | null;
  max_seals?: number;
  maxSeals?: number;
  locations: string[];
  category_id?: string;
}

export interface SealCategory {
  id: CategoryId;
  name: string;
  fullName: string;
  full_name?: string;
  description: string;
  icon: string;
  color: string;
  bonuses: SealBonuses;
  seals: Seal[];
}

export interface SealRange {
  min: number;
  max: number;
}

export interface SealRanges {
  normal: string;
  bronze: string;
  silver: string;
  gold: string;
  platinum: string;
  master: string;
}

// Tipos para la calculadora
export interface UserSealEntry {
  sealId: string; // categoryId-sealName
  categoryId: CategoryId;
  sealName: string;
  currentAmount: number;
  maxSeals: number;
}

export interface BuffTotals {
  at: number;
  ct: number;
  ht: number;
  hp: number;
  ds: number;
  de: number;
  bl: number;
  ev: number;
}

export interface CalculatorState {
  entries: UserSealEntry[];
  totals: BuffTotals;
}

// Tipos para filtros
export interface FilterState {
  search: string;
  category: CategoryId | "all";
  location: string;
  sortBy: "name" | "maxSeals" | "category";
  sortOrder: "asc" | "desc";
}

// Tipos para UI
export interface TabItem {
  id: string;
  label: string;
  icon?: string;
}

export interface ToastMessage {
  id: string;
  type: "success" | "error" | "info" | "warning";
  message: string;
}

// Constantes tipadas
export const CATEGORY_NAMES: Record<CategoryId, string> = {
  at: "Attack Damage",
  ct: "Critical Hit Rate",
  ht: "Hit Rate",
  hp: "Health Points",
  ds: "Digi-Soul Points",
  de: "Defense",
  bl: "Block Rate",
  ev: "Evade Rate",
};

export const CATEGORY_ICONS: Record<CategoryId, string> = {
  at: "⚔️",
  ct: "🎯",
  ht: "🎯",
  hp: "❤️",
  ds: "💎",
  de: "🛡️",
  bl: "🔰",
  ev: "💨",
};

export const LEVEL_COLORS: Record<SealLevel, string> = {
  unopened: "#6b7280",
  normal: "#3B82F6", // Azul
  bronze: "#CD7F32", // Bronce
  silver: "#9CA3AF", // Plata
  gold: "#F59E0B", // Oro
  platinum: "#14B8A6", // Platino/Turquesa
  master: "#A855F7", // Púrpura Master
};

export const LEVEL_NAMES: Record<SealLevel, string> = {
  unopened: "Sin abrir",
  normal: "Normal",
  bronze: "Bronce",
  silver: "Plata",
  gold: "Oro",
  platinum: "Platino",
  master: "Master",
};
