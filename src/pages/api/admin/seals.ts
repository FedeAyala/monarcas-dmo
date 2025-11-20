import type { APIRoute } from 'astro';
import { getSessionFromCookie, isValidSession } from '../../../lib/auth';
import { getAllSealsWithLocations } from '../../../lib/neon.js';

// GET /api/admin/seals - Obtener todos los seals con sus locaciones
export const GET: APIRoute = async ({ request }) => {
  const cookieHeader = request.headers.get('cookie');
  const token = getSessionFromCookie(cookieHeader);

  if (!isValidSession(token)) {
    return new Response(JSON.stringify({ error: 'No autorizado' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const seals = await getAllSealsWithLocations();
    return new Response(JSON.stringify({ seals }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error loading seals:', error);
    return new Response(
      JSON.stringify({
        error: 'Error al cargar los seals',
        details: error instanceof Error ? error.message : String(error)
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
};
