import { Modal } from "../ui/Modal";
import { SealFrame, FRAME_COLORS, getLevelFromAmount } from "./SealFrame";
import { Badge } from "../ui";
import { MapPin, Hash, TrendingUp } from "lucide-react";
import type { Seal, SealCategory, SealLevel } from "../../types";
import { LEVEL_NAMES } from "../../types";
import { getAllRanges } from "../../utils/calculator";

interface SealDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  seal: Seal | null;
  category: SealCategory | null;
  currentAmount?: number;
}

export function SealDetailModal({
  isOpen,
  onClose,
  seal,
  category,
  currentAmount = 0,
}: SealDetailModalProps) {
  if (!seal || !category) return null;

  const maxSeals = seal.max_seals || seal.maxSeals || 3000;
  const imageUrl = seal.image_url || seal.imageUrl;
  const ranges = getAllRanges(maxSeals);
  const currentLevel = getLevelFromAmount(currentAmount, maxSeals);
  const colors = FRAME_COLORS[currentLevel];

  const levels: Array<Exclude<SealLevel, "unopened">> = [
    "normal",
    "bronze",
    "silver",
    "gold",
    "platinum",
    "master",
  ];

  // Calcular progreso
  const progress = (currentAmount / maxSeals) * 100;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      className="overflow-hidden">
      <div className="space-y-6">
        {/* Header con SealFrame */}
        <div className="flex flex-col sm:flex-row items-center gap-6">
          {/* SealFrame grande */}
          <div
            className="flex-shrink-0"
            style={{ viewTransitionName: `seal-${seal.id || seal.name}` }}>
            <SealFrame
              name={seal.name}
              imageUrl={imageUrl}
              amount={currentAmount}
              maxSeals={maxSeals}
              size="lg"
              showAmount={currentAmount > 0}
            />
          </div>

          {/* Info principal */}
          <div className="flex-1 text-center sm:text-left">
            <h3 className="text-2xl font-bold text-white mb-2">{seal.name}</h3>

            <div className="flex flex-wrap gap-2 justify-center sm:justify-start mb-3">
              <Badge
                style={{
                  backgroundColor: `${category.color}30`,
                  color: category.color,
                  borderColor: `${category.color}50`,
                }}>
                {category.icon} {category.name}
              </Badge>

              {maxSeals !== 3000 && (
                <Badge variant="danger">Max: {maxSeals}</Badge>
              )}
            </div>

            {/* Barra de progreso */}
            {currentAmount > 0 && (
              <div className="mt-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-400">Progreso</span>
                  <span style={{ color: colors.accent }}>
                    {currentAmount.toLocaleString()} /{" "}
                    {maxSeals.toLocaleString()}
                  </span>
                </div>
                <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(progress, 100)}%`,
                      background: `linear-gradient(90deg, ${colors.primary}, ${colors.accent})`,
                      boxShadow: `0 0 10px ${colors.glow}60`,
                    }}
                  />
                </div>
                <div className="text-right text-xs text-slate-500 mt-1">
                  {progress.toFixed(1)}%
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Ubicaciones */}
        {(seal.locations || []).length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-slate-300 mb-2 flex items-center gap-2">
              <MapPin size={16} />
              Ubicaciones de Drop
            </h4>
            <div className="flex flex-wrap gap-2">
              {(seal.locations || []).map((loc, i) => (
                <span
                  key={i}
                  className="px-3 py-1.5 bg-slate-700/50 rounded-lg text-sm text-slate-300">
                  {loc}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Tabla de rangos y bonuses */}
        <div>
          <h4 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
            <TrendingUp size={16} />
            Rangos y Bonuses
          </h4>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {levels.map((level) => {
              const levelColors = FRAME_COLORS[level];
              const isCurrentLevel =
                level === currentLevel && currentAmount > 0;

              return (
                <div
                  key={level}
                  className={`
                    p-3 rounded-lg border transition-all
                    ${
                      isCurrentLevel
                        ? "ring-2 ring-offset-2 ring-offset-slate-800"
                        : "border-slate-700/50"
                    }
                  `}
                  style={{
                    backgroundColor: isCurrentLevel
                      ? `${levelColors.primary}20`
                      : "transparent",
                    borderColor: isCurrentLevel
                      ? levelColors.primary
                      : undefined,
                    ringColor: isCurrentLevel ? levelColors.primary : undefined,
                  }}>
                  <div
                    className="text-xs font-bold uppercase mb-1"
                    style={{ color: levelColors.primary }}>
                    {LEVEL_NAMES[level]}
                  </div>
                  <div className="text-sm text-slate-400 mb-2">
                    {ranges[level]} seals
                  </div>
                  <div
                    className="text-sm font-semibold"
                    style={{ color: levelColors.accent }}>
                    {seal.bonuses?.[level] || category.bonuses[level]}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Info adicional */}
        <div className="pt-4 border-t border-slate-700/50">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-400 flex items-center gap-1">
              <Hash size={14} />
              Categoría completa
            </span>
            <span className="text-slate-300">
              {category.fullName || category.full_name}
            </span>
          </div>
          {category.description && (
            <p className="text-xs text-slate-500 mt-2">
              {category.description}
            </p>
          )}
        </div>
      </div>
    </Modal>
  );
}
