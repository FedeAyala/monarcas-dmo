import type { CategoryId } from '../types';

// Configuración de niveles de seal
export const SEAL_LEVELS = [
  { name: 'Normal', color: '#3B82F6' },     // Azul
  { name: 'Bronze', color: '#CD7F32' },     // Bronce
  { name: 'Silver', color: '#9CA3AF' },     // Plata
  { name: 'Gold', color: '#F59E0B' },       // Oro
  { name: 'Platinum', color: '#14B8A6' },   // Platino/Turquesa
  { name: 'Master', color: '#A855F7' },     // Púrpura Master
] as const;

// Bonuses máximos por categoría (a nivel Master)
export const MAX_BONUSES: Record<CategoryId, number> = {
  at: 100,
  ct: 1,
  ht: 100,
  hp: 150,
  ds: 100,
  de: 80,
  bl: 1,
  ev: 1,
};

// Unidades de los bonuses
export const BONUS_UNITS: Record<CategoryId, string> = {
  at: '',
  ct: '%',
  ht: '',
  hp: '',
  ds: '',
  de: '',
  bl: '%',
  ev: '%',
};

// Información general sobre seals
export const SEAL_INFO = {
  description: 'Los Seals son ítems dropeados por ciertos Digimon que pueden usarse en el Sistema Seal Master. Las habilidades del Seal se aplican al Digimon invocado como estadísticas pasivas.',
  benefits: [
    'Aumentan el daño de ataque normal',
    'Aumentan la defensa',
    'Aumentan la tasa de bloqueo',
    'Aumentan la tasa de evasión',
    'Aumentan la tasa de acierto',
    'Aumentan el crítico',
    'Aumentan HP y DS'
  ],
  items: {
    opener: 'Seal Opener - Abre la Seal Card en la UI del Seal Master',
    closer: 'Seal Closer - Hace las Seal Cards intercambiables nuevamente'
  }
};

// Keys para localStorage
export const STORAGE_KEYS = {
  USER_SEALS: 'dmo-seals-user-collection',
  THEME: 'dmo-seals-theme',
  FILTERS: 'dmo-seals-filters',
} as const;

// Breakpoints de Tailwind para responsive
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;
