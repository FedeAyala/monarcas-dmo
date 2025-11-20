import { getAllSealsData, getLastUpdate, initializeSchema } from './neon';
import { sealCategories as fallbackData, sealLevels, sealInfo } from '../data/seals';
import type { SealCategory } from '../types';

export async function loadSealsData(): Promise<{
  categories: SealCategory[];
  lastUpdate: string | null;
  source: string;
}> {
  try {
    // Intentar cargar desde Neon
    await initializeSchema();
    const categories = await getAllSealsData();
    const lastUpdate = await getLastUpdate();
    
    if (categories.length === 0) {
      console.log('⚠️  Base de datos vacía, usando datos estáticos...');
      return {
        categories: fallbackData as SealCategory[],
        lastUpdate: null,
        source: 'static'
      };
    }
    
    console.log(`✅ Datos cargados desde Neon (última actualización: ${lastUpdate || 'N/A'})`);
    
    return {
      categories: categories as SealCategory[],
      lastUpdate,
      source: 'database'
    };
    
  } catch (error) {
    console.error('Error al cargar datos:', error);
    return {
      categories: fallbackData as SealCategory[],
      lastUpdate: null,
      source: 'static'
    };
  }
}

export { sealLevels, sealInfo };
