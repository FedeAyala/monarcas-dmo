import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { SealCategory } from '../types';

interface SealsState {
  // Datos
  categories: SealCategory[];
  lastUpdate: string | null;
  source: 'database' | 'fallback' | null;
  dataVersion: string | null; // Versión de los datos para invalidar caché

  // Estado de carga
  isLoading: boolean;
  error: string | null;

  // Acciones
  setSealsData: (data: {
    categories: SealCategory[];
    lastUpdate: string | null;
    source: 'database' | 'fallback';
    dataVersion?: string;
  }) => void;

  loadSealsData: () => Promise<void>;
  clearCache: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useSealsStore = create<SealsState>()(
  persist(
    (set, get) => ({
      // Estado inicial
      categories: [],
      lastUpdate: null,
      source: null,
      dataVersion: null,
      isLoading: false,
      error: null,

      // Establecer datos de seals
      setSealsData: (data) => {
        set({
          categories: data.categories,
          lastUpdate: data.lastUpdate,
          source: data.source,
          dataVersion: data.dataVersion || data.lastUpdate || new Date().toISOString(),
          isLoading: false,
          error: null,
        });
      },

      // Cargar datos de seals
      loadSealsData: async () => {
        const { isLoading, categories } = get();

        // Si ya está cargando, no hacer nada
        if (isLoading) return;

        // Si ya tenemos datos en caché, verificar si necesitamos actualizar (sin bloquear la UI)
        if (categories.length > 0) {
          try {
            // Verificar la versión del servidor en segundo plano
            const response = await fetch('/api/seals/version');
            if (response.ok) {
              const { version } = await response.json();
              const currentVersion = get().dataVersion;

              // Si la versión es la misma, usar caché
              if (version === currentVersion) {
                console.log('✅ Usando datos en caché (versión actual)');
                return;
              }

              console.log('🔄 Nueva versión detectada, actualizando...');
            }
          } catch (error) {
            // Si falla la verificación de versión, usar caché existente
            console.log('⚠️ Error verificando versión, usando caché');
            return;
          }
        }

        // Cargar datos frescos (mostrar loading solo si no hay datos en caché)
        set({ isLoading: true, error: null });

        try {
          const response = await fetch('/api/seals/data');

          if (!response.ok) {
            throw new Error('Error cargando datos de seals');
          }

          const data = await response.json();

          get().setSealsData({
            categories: data.categories,
            lastUpdate: data.lastUpdate,
            source: data.source,
            dataVersion: data.version,
          });

          console.log('✅ Datos cargados desde el servidor');
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
          set({ error: errorMessage, isLoading: false });
          console.error('❌ Error cargando datos:', error);
        }
      },

      // Limpiar caché
      clearCache: () => {
        set({
          categories: [],
          lastUpdate: null,
          source: null,
          dataVersion: null,
          error: null,
        });
        console.log('🗑️ Caché limpiado');
      },

      // Establecer estado de carga
      setLoading: (loading) => set({ isLoading: loading }),

      // Establecer error
      setError: (error) => set({ error, isLoading: false }),
    }),
    {
      name: 'dmo-seals-storage', // Nombre para localStorage
      partialize: (state) => ({
        categories: state.categories,
        lastUpdate: state.lastUpdate,
        source: state.source,
        dataVersion: state.dataVersion,
      }),
    }
  )
);
