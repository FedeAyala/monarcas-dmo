import type { APIRoute } from 'astro';
import { loadSealsData } from '../../../lib/dataLoader';

// GET /api/seals/data - Obtener todos los datos de seals
export const GET: APIRoute = async () => {
  try {
    const data = await loadSealsData();

    return new Response(
      JSON.stringify({
        ...data,
        version: data.lastUpdate || new Date().toISOString(),
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=300', // Cache por 5 minutos
        },
      }
    );
  } catch (error) {
    console.error('Error loading seals data:', error);
    return new Response(
      JSON.stringify({
        error: 'Error cargando datos de seals',
        details: error instanceof Error ? error.message : String(error),
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
