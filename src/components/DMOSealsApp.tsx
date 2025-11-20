import { useState, useEffect } from "react";
import {
  Calculator,
  List,
  Download,
  Upload,
  Trash2,
  Github,
  RefreshCw,
  Home,
} from "lucide-react";
import { useCalculator } from "../hooks/useCalculator";
import { useIsClient } from "../hooks/useLocalStorage";
import { useSealsStore } from "../store/sealsStore";
import { Button, Card, CardContent, LoadingScreen } from "./ui";
import { SealFilters } from "./seals/SealFilters";
import { CategorySection } from "./seals/CategorySection";
import { BuffSummary } from "./calculator/BuffSummary";
import { SealDetailModal } from "./seals/SealDetailModal";
import type { SealCategory, CategoryId, Seal } from "../types";

interface DMOSealsAppProps {
  categories: SealCategory[];
  lastUpdate: string | null;
  source: string;
}

type ViewMode = "browse" | "calculator";

export function DMOSealsApp({
  categories: initialCategories,
  lastUpdate: initialLastUpdate,
  source: initialSource,
}: DMOSealsAppProps) {
  // ⚠️ TODOS LOS HOOKS DEBEN ESTAR AL INICIO - NUNCA DESPUÉS DE UN RETURN
  const isClient = useIsClient();
  const [dataInitialized, setDataInitialized] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("browse");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<CategoryId | "all">(
    "all"
  );
  const [selectedSeal, setSelectedSeal] = useState<Seal | null>(null);
  const [selectedSealCategory, setSelectedSealCategory] =
    useState<SealCategory | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Zustand store
  const {
    categories: cachedCategories,
    lastUpdate: cachedLastUpdate,
    source: cachedSource,
    isLoading,
    loadSealsData,
    clearCache,
  } = useSealsStore();

  // Usar datos del store si existen, sino usar los iniciales
  const categories =
    cachedCategories.length > 0 ? cachedCategories : initialCategories;
  const lastUpdate = cachedLastUpdate || initialLastUpdate;
  const source = cachedSource || initialSource;

  // Hook de calculadora
  const {
    entries,
    totals,
    addEntry,
    removeEntry,
    updateAmount,
    clearAll,
    exportEntries,
    importEntries,
  } = useCalculator(categories);

  // Cargar datos desde la API si no hay datos en cache
  useEffect(() => {
    if (isClient && !dataInitialized) {
      setDataInitialized(true);
      if (cachedCategories.length === 0) {
        loadSealsData();
      }
    }
  }, [isClient, dataInitialized, cachedCategories.length]);

  // Mostrar loading mientras no tengamos datos listos
  const shouldShowLoading =
    !isClient || !dataInitialized || (categories.length === 0 && isLoading);

  if (shouldShowLoading) {
    return (
      <LoadingScreen
        message="Cargando datos de Seals"
        tip="Esto puede demorar unos momentos. Estamos cargando toda la información de los Digimon..."
        appName="DMO Seal Master"
        subtitle="Cargando recursos del sistema..."
      />
    );
  }

  // Si no hay datos y no está cargando, algo salió mal
  if (categories.length === 0 && !isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center space-y-4 p-8">
          <h2 className="text-2xl font-bold text-white">
            Error cargando datos
          </h2>
          <p className="text-slate-400">
            No se pudieron cargar los datos de los Seals.
          </p>
          <button
            onClick={() => {
              setDataInitialized(false);
              loadSealsData();
            }}
            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors">
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  // Filtrar categorías
  const filteredCategories =
    selectedCategory === "all"
      ? categories
      : categories.filter((cat) => cat.id === selectedCategory);

  // Abrir modal de detalle
  const handleSealClick = (seal: Seal, category: SealCategory) => {
    setSelectedSeal(seal);
    setSelectedSealCategory(category);
    setIsModalOpen(true);
  };

  // Cerrar modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedSeal(null);
    setSelectedSealCategory(null);
  };

  // Obtener cantidad actual de una seal
  const getCurrentAmount = (
    sealName: string,
    categoryId: CategoryId
  ): number => {
    const entry = entries.find(
      (e) => e.sealName === sealName && e.categoryId === categoryId
    );
    return entry?.currentAmount || 0;
  };

  // Exportar configuración
  const handleExport = () => {
    const data = exportEntries();
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "dmo-seals-collection.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  // Importar configuración
  const handleImport = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const data = JSON.parse(e.target?.result as string);
            importEntries(data);
          } catch {
            alert("Error al importar el archivo");
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700/50 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <a
                href="/"
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800/50 border border-slate-700/50 hover:border-dmo-primary hover:bg-slate-800 transition-all group"
                title="Volver al menú principal">
                <Home
                  size={18}
                  className="text-slate-400 group-hover:text-dmo-primary transition-colors"
                />
                <span className="hidden sm:inline text-sm text-slate-300 group-hover:text-white transition-colors">
                  Menú Principal
                </span>
              </a>
              <div className="border-l border-slate-700/50 pl-3">
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                  🎮 DMO Seal Master
                </h1>
                <p className="text-sm text-slate-400">
                  Guía completa del sistema de Seals de Digimon Masters Online
                </p>
              </div>
            </div>

            {/* Controles de vista */}
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === "browse" ? "primary" : "ghost"}
                size="sm"
                onClick={() => setViewMode("browse")}
                icon={<List size={16} />}>
                Explorar
              </Button>
              <Button
                variant={viewMode === "calculator" ? "primary" : "ghost"}
                size="sm"
                onClick={() => setViewMode("calculator")}
                icon={<Calculator size={16} />}>
                Calculadora
              </Button>
            </div>
          </div>

          {/* Info de actualización */}
          <div className="mt-3 flex items-center gap-3 text-xs">
            {lastUpdate && (
              <span className="text-slate-500">
                📅 Actualizado:{" "}
                {new Date(lastUpdate).toLocaleDateString("es-AR")}
              </span>
            )}
            <span
              className={`px-2 py-0.5 rounded ${
                source === "database"
                  ? "bg-emerald-500/20 text-emerald-400"
                  : "bg-amber-500/20 text-amber-400"
              }`}>
              {source === "database" ? "🗄️ Base de datos" : "📄 Estático"}
            </span>
            {isClient && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  clearCache();
                  window.location.reload();
                }}
                icon={
                  <RefreshCw
                    size={12}
                    className={isLoading ? "animate-spin" : ""}
                  />
                }
                disabled={isLoading}>
                {isLoading ? "Actualizando..." : "Actualizar"}
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Modo Calculadora */}
        {viewMode === "calculator" && isClient && (
          <div className="mb-6 space-y-4">
            <BuffSummary entries={entries} />

            {/* Acciones de la calculadora */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleExport}
                icon={<Download size={14} />}
                disabled={entries.length === 0}>
                Exportar
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleImport}
                icon={<Upload size={14} />}>
                Importar
              </Button>
              {entries.length > 0 && (
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => {
                    if (confirm("¿Eliminar todas las seals seleccionadas?")) {
                      clearAll();
                    }
                  }}
                  icon={<Trash2 size={14} />}>
                  Limpiar
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Filtros */}
        <div className="mb-6">
          <SealFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            categories={categories.map((c) => ({
              id: c.id,
              name: c.name,
              icon: c.icon,
            }))}
          />
        </div>

        {/* Listado de categorías y seals */}
        <div>
          {filteredCategories.map((category) => (
            <CategorySection
              key={category.id}
              category={category}
              showCalculator={viewMode === "calculator"}
              entries={entries}
              onAddEntry={addEntry}
              onUpdateAmount={updateAmount}
              onSealClick={handleSealClick}
              searchQuery={searchQuery}
            />
          ))}
        </div>

        {/* Estado vacío */}
        {filteredCategories.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-slate-400">No se encontraron seals</p>
              <p className="text-sm text-slate-500 mt-1">
                Probá con otra búsqueda o categoría
              </p>
            </CardContent>
          </Card>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-700/50 mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6 text-center">
          <p className="text-sm text-slate-400">
            Datos de{" "}
            <a
              href="https://dmowiki.com/Seal_Master"
              target="_blank"
              rel="noopener noreferrer"
              className="text-dmo-primary hover:underline">
              DMO Wiki
            </a>
          </p>
          <p className="text-xs text-slate-500 mt-1">
            No afiliado con Bandai Namco ni los creadores de Digimon Masters
            Online
          </p>
        </div>
      </footer>

      {/* Modal de detalle de seal */}
      <SealDetailModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        seal={selectedSeal}
        category={selectedSealCategory}
        currentAmount={
          selectedSeal && selectedSealCategory
            ? getCurrentAmount(selectedSeal.name, selectedSealCategory.id)
            : 0
        }
      />
    </div>
  );
}
