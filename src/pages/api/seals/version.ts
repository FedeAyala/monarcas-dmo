import type { APIRoute } from 'astro';
import { getLastUpdate } from '../../../lib/neon.js';

// GET /api/seals/version - Obtener versión de datos para caché
export const GET: APIRoute = async () => {
  try {
    const lastUpdate = await getLastUpdate();
    const version = lastUpdate || new Date().toISOString();

    return new Response(
      JSON.stringify({ version }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      }
    );
  } catch (error) {
    console.error('Error getting version:', error);
    return new Response(
      JSON.stringify({
        version: new Date().toISOString(),
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
