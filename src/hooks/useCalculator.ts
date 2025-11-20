import { useMemo, useCallback } from "react";
import { useLocalStorage } from "./useLocalStorage";
import { calculateBonus, parseBonusString } from "../utils/calculator";
import { STORAGE_KEYS } from "../utils/constants";
import type {
  UserSealEntry,
  BuffTotals,
  CategoryId,
  SealCategory,
} from "../types";

interface UseCalculatorReturn {
  entries: UserSealEntry[];
  totals: BuffTotals;
  addEntry: (
    categoryId: CategoryId,
    sealName: string,
    maxSeals: number,
    sealBonuses?: Record<string, string>
  ) => void;
  removeEntry: (sealId: string) => void;
  updateAmount: (sealId: string, amount: number) => void;
  clearAll: () => void;
  importEntries: (entries: UserSealEntry[]) => void;
  exportEntries: () => string;
  getEntryBySealId: (sealId: string) => UserSealEntry | undefined;
  hasEntry: (categoryId: CategoryId, sealName: string) => boolean;
}

/**
 * Hook principal para manejar la calculadora de buffs
 */
export function useCalculator(categories: SealCategory[]): UseCalculatorReturn {
  const [entries, setEntries] = useLocalStorage<UserSealEntry[]>(
    STORAGE_KEYS.USER_SEALS,
    []
  );

  // Calcular totales de buffs
  const totals = useMemo<BuffTotals>(() => {
    const result: BuffTotals = {
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
        ? parseBonusString(entry.sealBonuses.master)
        : undefined;
      const bonus = calculateBonus(
        entry.currentAmount,
        entry.maxSeals,
        entry.categoryId,
        overrideMax
      );
      result[entry.categoryId] += bonus;
    }

    return result;
  }, [entries]);

  // Agregar nueva entrada
  const addEntry = useCallback(
    (
      categoryId: CategoryId,
      sealName: string,
      maxSeals: number,
      sealBonuses?: Record<string, string>
    ) => {
      const sealId = `${categoryId}-${sealName}`;

      setEntries((prev) => {
        // Evitar duplicados
        if (prev.some((e) => e.sealId === sealId)) {
          return prev;
        }

        return [
          ...prev,
          {
            sealId,
            categoryId,
            sealName,
            currentAmount: 0,
            maxSeals,
            sealBonuses,
          },
        ];
      });
    },
    [setEntries]
  );

  // Eliminar entrada
  const removeEntry = useCallback(
    (sealId: string) => {
      setEntries((prev) => prev.filter((e) => e.sealId !== sealId));
    },
    [setEntries]
  );

  // Actualizar cantidad
  const updateAmount = useCallback(
    (sealId: string, amount: number) => {
      setEntries((prev) =>
        prev.map((entry) => {
          if (entry.sealId === sealId) {
            return {
              ...entry,
              currentAmount: Math.max(0, Math.min(amount, entry.maxSeals)),
            };
          }
          return entry;
        })
      );
    },
    [setEntries]
  );

  // Limpiar todo
  const clearAll = useCallback(() => {
    setEntries([]);
  }, [setEntries]);

  // Importar entradas
  const importEntries = useCallback(
    (newEntries: UserSealEntry[]) => {
      setEntries(newEntries);
    },
    [setEntries]
  );

  // Exportar entradas como JSON
  const exportEntries = useCallback(() => {
    return JSON.stringify(entries, null, 2);
  }, [entries]);

  // Obtener entrada por ID
  const getEntryBySealId = useCallback(
    (sealId: string) => {
      return entries.find((e) => e.sealId === sealId);
    },
    [entries]
  );

  // Verificar si existe entrada
  const hasEntry = useCallback(
    (categoryId: CategoryId, sealName: string) => {
      const sealId = `${categoryId}-${sealName}`;
      return entries.some((e) => e.sealId === sealId);
    },
    [entries]
  );

  return {
    entries,
    totals,
    addEntry,
    removeEntry,
    updateAmount,
    clearAll,
    importEntries,
    exportEntries,
    getEntryBySealId,
    hasEntry,
  };
}
