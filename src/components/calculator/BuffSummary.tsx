import { Card, CardHeader, CardContent } from "../ui";
import { CATEGORY_ICONS, CATEGORY_NAMES } from "../../types";
import type { BuffTotals, CategoryId, UserSealEntry } from "../../types";
import { BONUS_UNITS } from "../../utils/constants";
import { calculateBonus, parseBonusString } from "../../utils/calculator";

interface BuffSummaryProps {
  entries: UserSealEntry[];
}

export function BuffSummary({ entries }: BuffSummaryProps) {
  const categories: CategoryId[] = [
    "at",
    "ct",
    "ht",
    "hp",
    "ds",
    "de",
    "bl",
    "ev",
  ];

  // Calcular totales desde las entradas, respetando bonuses por seal cuando existan
  const totals: BuffTotals = {
    at: 0,
    ct: 0,
    ht: 0,
    hp: 0,
    ds: 0,
    de: 0,
    bl: 0,
    ev: 0,
  };

  for (const entry of entries) {
    const overrideMax = entry.sealBonuses
      ? parseBonusString((entry.sealBonuses as any).master)
      : undefined;
    const bonus = calculateBonus(
      entry.currentAmount,
      entry.maxSeals,
      entry.categoryId,
      overrideMax
    );
    totals[entry.categoryId] += bonus;
  }

  const entriesCount = entries.length;

  const formatValue = (value: number, categoryId: CategoryId) => {
    const unit = BONUS_UNITS[categoryId];
    if (unit === "%") {
      return `+${value.toFixed(1)}%`;
    }
    return `+${Math.round(value)}`;
  };

  const getCategoryColor = (categoryId: CategoryId) => {
    const colors: Record<CategoryId, string> = {
      at: "#ef4444",
      ct: "#f59e0b",
      ht: "#10b981",
      hp: "#ec4899",
      ds: "#6366f1",
      de: "#3b82f6",
      bl: "#14b8a6",
      ev: "#8b5cf6",
    };
    return colors[categoryId];
  };

  const hasAnyBuff = Object.values(totals).some((v) => v > 0);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-white">📊 Buffs Totales</h2>
          <span className="text-xs text-slate-400">
            {entriesCount} seal{entriesCount !== 1 ? "s" : ""} seleccionado
            {entriesCount !== 1 ? "s" : ""}
          </span>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {hasAnyBuff ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {categories.map((catId) => {
              const value = totals[catId];
              const color = getCategoryColor(catId);

              return (
                <div
                  key={catId}
                  className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm">{CATEGORY_ICONS[catId]}</span>
                    <span className="text-xs font-medium text-slate-400 uppercase">
                      {catId}
                    </span>
                  </div>
                  <div
                    className="text-lg font-bold"
                    style={{ color: value > 0 ? color : "#64748b" }}>
                    {formatValue(value, catId)}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-6 text-slate-500">
            <p className="text-sm">No hay seals seleccionados</p>
            <p className="text-xs mt-1">
              Agregá seals y especificá la cantidad para ver tus buffs totales
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
