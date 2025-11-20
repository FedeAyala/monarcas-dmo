import { clsx } from 'clsx';
import type { SealLevel } from '../../types';

// Colores basados en las imágenes de referencia
export const FRAME_COLORS: Record<Exclude<SealLevel, 'unopened'>, {
  primary: string;      // Color principal del marco
  secondary: string;    // Color secundario/gradiente
  glow: string;         // Color del brillo/glow
  background: string;   // Color de fondo
  text: string;         // Color del texto
  accent: string;       // Color de acento
}> = {
  normal: {
    primary: '#3B82F6',     // Azul
    secondary: '#1D4ED8',
    glow: '#60A5FA',
    background: '#1E3A5F',
    text: '#E0F2FE',
    accent: '#93C5FD',
  },
  bronze: {
    primary: '#CD7F32',     // Bronce
    secondary: '#8B4513',
    glow: '#DDA15E',
    background: '#3D2817',
    text: '#FED7AA',
    accent: '#F59E0B',
  },
  silver: {
    primary: '#9CA3AF',     // Plata
    secondary: '#6B7280',
    glow: '#D1D5DB',
    background: '#374151',
    text: '#F3F4F6',
    accent: '#E5E7EB',
  },
  gold: {
    primary: '#F59E0B',     // Oro
    secondary: '#D97706',
    glow: '#FCD34D',
    background: '#451A03',
    text: '#FEF3C7',
    accent: '#FBBF24',
  },
  platinum: {
    primary: '#14B8A6',     // Platino/Turquesa
    secondary: '#0D9488',
    glow: '#5EEAD4',
    background: '#134E4A',
    text: '#CCFBF1',
    accent: '#2DD4BF',
  },
  master: {
    primary: '#A855F7',     // Púrpura Master
    secondary: '#7C3AED',
    glow: '#C084FC',
    background: '#3B0764',
    text: '#F3E8FF',
    accent: '#D946EF',
  },
};

// Umbrales para determinar el nivel basado en cantidad y maxSeals
export function getLevelFromAmount(amount: number, maxSeals: number = 3000): Exclude<SealLevel, 'unopened'> {
  const thresholds = calculateThresholds(maxSeals);
  
  if (amount >= thresholds.master) return 'master';
  if (amount >= thresholds.platinum) return 'platinum';
  if (amount >= thresholds.gold) return 'gold';
  if (amount >= thresholds.silver) return 'silver';
  if (amount >= thresholds.bronze) return 'bronze';
  return 'normal';
}

// Calcular umbrales según maxSeals
function calculateThresholds(maxSeals: number) {
  if (maxSeals === 150) {
    return { normal: 0, bronze: 5, silver: 15, gold: 25, platinum: 50, master: 150 };
  }
  if (maxSeals === 1000) {
    return { normal: 0, bronze: 34, silver: 100, gold: 167, platinum: 334, master: 1000 };
  }
  // Default para 3000
  return { normal: 0, bronze: 100, silver: 300, gold: 500, platinum: 1000, master: 3000 };
}

interface SealFrameProps {
  name: string;
  imageUrl?: string | null;
  amount: number;
  maxSeals?: number;
  level?: Exclude<SealLevel, 'unopened'>;  // Opcional: forzar un nivel específico
  size?: 'sm' | 'md' | 'lg';
  showAmount?: boolean;
  className?: string;
  onClick?: () => void;
}

export function SealFrame({
  name,
  imageUrl,
  amount,
  maxSeals = 3000,
  level: forcedLevel,
  size = 'md',
  showAmount = true,
  className,
  onClick,
}: SealFrameProps) {
  const level = forcedLevel || getLevelFromAmount(amount, maxSeals);
  const colors = FRAME_COLORS[level];
  
  // Tamaños según size prop
  const sizeConfig = {
    sm: {
      container: 'w-24',
      image: 'w-10 h-10',
      nameText: 'text-[8px]',
      amountText: 'text-xs',
      padding: 'p-1.5',
      borderWidth: 'border-2',
    },
    md: {
      container: 'w-32',
      image: 'w-14 h-14',
      nameText: 'text-[10px]',
      amountText: 'text-sm',
      padding: 'p-2',
      borderWidth: 'border-3',
    },
    lg: {
      container: 'w-40',
      image: 'w-20 h-20',
      nameText: 'text-xs',
      amountText: 'text-lg',
      padding: 'p-3',
      borderWidth: 'border-4',
    },
  };

  const config = sizeConfig[size];

  return (
    <div
      className={clsx(
        'relative rounded-lg overflow-hidden cursor-pointer transition-all duration-300',
        'hover:scale-105 hover:shadow-xl',
        config.container,
        className
      )}
      style={{
        boxShadow: `0 0 20px ${colors.glow}40, inset 0 0 30px ${colors.primary}20`,
      }}
      onClick={onClick}
    >
      {/* Marco exterior */}
      <div
        className={clsx(
          'absolute inset-0 rounded-lg',
          config.borderWidth
        )}
        style={{
          borderColor: colors.primary,
          background: `linear-gradient(135deg, ${colors.primary}20 0%, ${colors.secondary}40 100%)`,
        }}
      />
      
      {/* Decoración de esquinas */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Esquina superior izquierda */}
        <div
          className="absolute top-0 left-0 w-3 h-3"
          style={{
            borderTop: `2px solid ${colors.accent}`,
            borderLeft: `2px solid ${colors.accent}`,
          }}
        />
        {/* Esquina superior derecha */}
        <div
          className="absolute top-0 right-0 w-3 h-3"
          style={{
            borderTop: `2px solid ${colors.accent}`,
            borderRight: `2px solid ${colors.accent}`,
          }}
        />
        {/* Esquina inferior izquierda */}
        <div
          className="absolute bottom-0 left-0 w-3 h-3"
          style={{
            borderBottom: `2px solid ${colors.accent}`,
            borderLeft: `2px solid ${colors.accent}`,
          }}
        />
        {/* Esquina inferior derecha */}
        <div
          className="absolute bottom-0 right-0 w-3 h-3"
          style={{
            borderBottom: `2px solid ${colors.accent}`,
            borderRight: `2px solid ${colors.accent}`,
          }}
        />
      </div>

      {/* Contenido principal */}
      <div
        className={clsx(
          'relative flex flex-col items-center',
          config.padding
        )}
        style={{ backgroundColor: colors.background }}
      >
        {/* Icono de tipo/categoría (esquina superior izquierda) */}
        <div
          className="absolute top-1 left-1 w-4 h-4 rounded-full flex items-center justify-center"
          style={{ backgroundColor: `${colors.primary}60` }}
        >
          <span className="text-[8px]">🔵</span>
        </div>

        {/* Imagen del Digimon */}
        <div
          className={clsx(
            'rounded-md overflow-hidden mb-1.5 flex items-center justify-center',
            config.image
          )}
          style={{ 
            backgroundColor: `${colors.primary}30`,
            border: `1px solid ${colors.primary}50`,
          }}
        >
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={name}
              className="w-full h-full object-contain"
              loading="lazy"
            />
          ) : (
            <span className="text-lg">❓</span>
          )}
        </div>

        {/* Nombre del Digimon */}
        <div
          className={clsx(
            'w-full text-center font-bold uppercase tracking-wide truncate px-1',
            config.nameText
          )}
          style={{ color: colors.text }}
        >
          {name}
        </div>

        {/* Cantidad de seals */}
        {showAmount && (
          <div
            className={clsx(
              'mt-1 font-bold tabular-nums',
              config.amountText
            )}
            style={{ 
              color: colors.accent,
              textShadow: `0 0 10px ${colors.glow}80`,
            }}
          >
            {amount.toLocaleString()}
          </div>
        )}
      </div>

      {/* Efecto de brillo superior */}
      <div
        className="absolute top-0 left-0 right-0 h-1/3 pointer-events-none"
        style={{
          background: `linear-gradient(180deg, ${colors.glow}20 0%, transparent 100%)`,
        }}
      />
    </div>
  );
}

// Componente para mostrar todos los niveles (útil para preview)
interface SealFramePreviewProps {
  name: string;
  imageUrl?: string | null;
  maxSeals?: number;
}

export function SealFramePreview({ name, imageUrl, maxSeals = 3000 }: SealFramePreviewProps) {
  const thresholds = calculateThresholds(maxSeals);
  const levels: Array<Exclude<SealLevel, 'unopened'>> = ['normal', 'bronze', 'silver', 'gold', 'platinum', 'master'];
  
  return (
    <div className="flex flex-wrap gap-3 justify-center">
      {levels.map((level) => (
        <SealFrame
          key={level}
          name={name}
          imageUrl={imageUrl}
          amount={thresholds[level]}
          maxSeals={maxSeals}
          size="sm"
        />
      ))}
    </div>
  );
}
