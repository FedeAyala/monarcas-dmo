import { clsx } from "clsx";
import { Plus } from "lucide-react";
import { Badge, Button } from "../ui";
import {
  getAllRanges,
  getCurrentLevel,
  getLevelColor,
} from "../../utils/calculator";
import type { Seal, CategoryId } from "../../types";
import { LEVEL_NAMES } from "../../types";

interface SealCardProps {
  seal: Seal;
  categoryId: CategoryId;
  categoryColor: string;
  isSelected?: boolean;
  currentAmount?: number;
  onSelect?: () => void;
  onAmountChange?: (amount: number) => void;
  showCalculator?: boolean;
  onClick?: () => void;
}

export function SealCard({
  seal,
  categoryId,
  categoryColor,
  isSelected = false,
  currentAmount = 0,
  onSelect,
  onAmountChange,
  showCalculator = false,
  onClick,
}: SealCardProps) {
  const maxSeals = seal.max_seals || seal.maxSeals || 3000;
  const imageUrl = seal.image_url || seal.imageUrl;
  const ranges = getAllRanges(maxSeals);
  const currentLevel = getCurrentLevel(currentAmount, maxSeals);
  const levelColor = getLevelColor(currentLevel);

  // Obtener el color y gradiente basado en el nivel actual
  // SOLO si showCalculator está activo (evita problemas de hidratación)
  const getLevelGradient = () => {
    if (!showCalculator || currentAmount === 0) {
      return "from-slate-800 to-slate-900";
    }

    switch (currentLevel) {
      case "normal":
        return "from-blue-800/50 via-blue-900/40 to-slate-900";
      case "bronze":
        return "from-orange-900/50 via-amber-950/40 to-slate-900";
      case "silver":
        return "from-slate-500/50 via-slate-700/40 to-slate-900";
      case "gold":
        return "from-yellow-600/50 via-yellow-800/40 to-slate-900";
      case "platinum":
        return "from-cyan-600/50 via-cyan-800/40 to-slate-900";
      case "master":
        return "from-fuchsia-600/50 via-pink-800/40 to-slate-900";
      default:
        return "from-slate-800 to-slate-900";
    }
  };

  const getLevelBorderColor = () => {
    if (!showCalculator || currentAmount === 0) {
      return "border-slate-700/50";
    }

    switch (currentLevel) {
      case "normal":
        return "border-blue-500/60";
      case "bronze":
        return "border-orange-600/60";
      case "silver":
        return "border-slate-400/60";
      case "gold":
        return "border-yellow-500/60";
      case "platinum":
        return "border-cyan-500/60";
      case "master":
        return "border-fuchsia-500/60";
      default:
        return "border-slate-700/50";
    }
  };

  return (
    <div
      onClick={!showCalculator ? onClick : undefined}
      className={clsx(
        "overflow-hidden rounded-xl border transition-all duration-300",
        "bg-gradient-to-br",
        getLevelGradient(),
        getLevelBorderColor(),
        !showCalculator && "cursor-pointer hover:scale-105 hover:shadow-xl",
        isSelected && "ring-2 ring-dmo-primary",
        showCalculator && currentAmount > 0 && "shadow-lg"
      )}>
      {/* Imagen centrada arriba */}
      <div className="relative p-4 pb-2 flex flex-col items-center">
        {/* Badge de max seals si no es 3000 */}
        {maxSeals !== 3000 && (
          <div className="absolute top-2 right-2">
            <Badge
              variant="danger"
              className={clsx(
                maxSeals === 150 ? "bg-red-600/80" : "bg-purple-600/80"
              )}>
              {maxSeals}
            </Badge>
          </div>
        )}

        {/* Imagen del Digimon */}
        <div
          className="w-16 h-16 rounded-lg flex items-center justify-center mb-2 overflow-hidden"
          style={{ backgroundColor: `${categoryColor}20` }}>
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={seal.name}
              className="w-12 h-12 object-contain"
              loading="lazy"
            />
          ) : (
            <span className="text-2xl">❓</span>
          )}
        </div>

        {/* Nombre del Digimon */}
        <h3 className="font-semibold text-white text-sm text-center truncate w-full">
          {seal.name}
        </h3>

        {/* Badge de nivel de maestría - Solo visible en calculadora si hay cantidad */}
        {showCalculator && currentAmount > 0 && (
          <div className="mt-2">
            <Badge
              className="text-[10px] font-bold"
              style={{
                backgroundColor: `${levelColor}30`,
                color: levelColor,
                borderColor: `${levelColor}60`,
                border: "1px solid",
              }}>
              {LEVEL_NAMES[currentLevel]}
            </Badge>
          </div>
        )}
      </div>

      {/* Ubicaciones */}
      <div className="px-4 pb-2">
        <div className="flex flex-wrap gap-1 justify-center">
          {(seal.locations || []).slice(0, 2).map((loc, i) => (
            <span
              key={i}
              className="text-[10px] px-2 py-1 bg-slate-950/80 border border-slate-700/50 rounded text-slate-200 truncate max-w-[100px] font-medium">
              {loc}
            </span>
          ))}
          {(seal.locations || []).length > 2 && (
            <span className="text-[10px] text-slate-300 font-medium bg-slate-950/60 px-1.5 py-0.5 rounded">
              +{(seal.locations || []).length - 2}
            </span>
          )}
        </div>
      </div>

      {/* Rangos de niveles */}
      <div className="px-3 py-2 bg-slate-900/50 border-t border-slate-700/50">
        <div className="grid grid-cols-6 gap-1 text-center">
          {(
            [
              "normal",
              "bronze",
              "silver",
              "gold",
              "platinum",
              "master",
            ] as const
          ).map((level) => (
            <div key={level} className="flex flex-col">
              <span
                className="text-[9px] font-bold uppercase"
                style={{ color: getLevelColor(level) }}>
                {level[0].toUpperCase()}
              </span>
              <span className="text-[8px] text-slate-400">{ranges[level]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Sección de calculadora */}
      {showCalculator && (
        <div className="p-3 border-t border-slate-700/50 bg-slate-900/30">
          {isSelected ? (
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                max={maxSeals}
                value={currentAmount || ''}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '') {
                    onAmountChange?.(0);
                  } else {
                    const numValue = parseInt(value);
                    if (!isNaN(numValue) && numValue >= 0 && numValue <= maxSeals) {
                      onAmountChange?.(numValue);
                    }
                  }
                }}
                onFocus={(e) => e.target.select()}
                className="flex-1 bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm text-white text-center focus:outline-none focus:border-dmo-primary"
                placeholder="0"
              />
              <span className="text-xs text-slate-400">/ {maxSeals}</span>
            </div>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              fullWidth
              onClick={onSelect}
              icon={<Plus size={14} />}>
              Agregar
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
