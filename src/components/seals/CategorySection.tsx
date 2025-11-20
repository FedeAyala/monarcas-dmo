import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { clsx } from "clsx";
import { SealCard } from "./SealCard";
import type {
  SealCategory,
  CategoryId,
  UserSealEntry,
  Seal,
} from "../../types";

interface CategorySectionProps {
  category: SealCategory;
  showCalculator?: boolean;
  entries?: UserSealEntry[];
  onAddEntry?: (
    categoryId: CategoryId,
    sealName: string,
    maxSeals: number,
    sealBonuses?: Record<string, string>
  ) => void;
  onUpdateAmount?: (sealId: string, amount: number) => void;
  onSealClick?: (seal: Seal, category: SealCategory) => void;
  searchQuery?: string;
}

export function CategorySection({
  category,
  showCalculator = false,
  entries = [],
  onAddEntry,
  onUpdateAmount,
  onSealClick,
  searchQuery = "",
}: CategorySectionProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Filtrar seals por búsqueda
  const filteredSeals = category.seals.filter((seal) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      seal.name.toLowerCase().includes(query) ||
      (seal.locations || []).some((loc) => loc.toLowerCase().includes(query))
    );
  });

  if (filteredSeals.length === 0) return null;

  return (
    <div className="mb-6 animate-fade-in">
      {/* Header de categoría */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="w-full flex items-center justify-between p-4 bg-slate-800/60 rounded-t-xl border border-slate-700/50 hover:bg-slate-800/80 transition-colors"
        style={{ borderLeftColor: category.color, borderLeftWidth: "4px" }}>
        <div className="flex items-center gap-3">
          <span className="text-2xl">{category.icon}</span>
          <div className="text-left">
            <h2 className="font-semibold text-white">
              {category.name} - {category.fullName || category.full_name}
            </h2>
            <p className="text-xs text-slate-400">{category.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-400">
            {filteredSeals.length} seals
          </span>
          <ChevronDown
            className={clsx(
              "w-5 h-5 text-slate-400 transition-transform duration-200",
              isCollapsed && "-rotate-90"
            )}
          />
        </div>
      </button>

      {/* Contenido */}
      {!isCollapsed && (
        <div className="p-4 bg-slate-900/30 rounded-b-xl border border-t-0 border-slate-700/50">
          {/* Grid de seals */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {filteredSeals.map((seal) => {
              const maxSeals = seal.max_seals || seal.maxSeals || 3000;
              const sealId = `${category.id}-${seal.name}`;
              const entry = entries.find((e) => e.sealId === sealId);

              return (
                <SealCard
                  key={sealId}
                  seal={seal}
                  categoryId={category.id as CategoryId}
                  categoryColor={category.color}
                  showCalculator={showCalculator}
                  isSelected={!!entry}
                  currentAmount={entry?.currentAmount || 0}
                  onSelect={() =>
                    onAddEntry?.(
                      category.id as CategoryId,
                      seal.name,
                      maxSeals,
                      (seal as any).bonuses
                    )
                  }
                  onAmountChange={(amount) => onUpdateAmount?.(sealId, amount)}
                  onClick={() => onSealClick?.(seal, category)}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
