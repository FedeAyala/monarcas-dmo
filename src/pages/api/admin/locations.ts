import type { APIRoute } from 'astro';
import { getSessionFromCookie, isValidSession } from '../../../lib/auth';
import {
  getLocationsBySealId,
  addLocationToSeal,
  deleteLocation,
  updateLocation
} from '../../../lib/neon.js';

// GET /api/admin/locations?sealId=123 - Obtener locaciones de un seal
export const GET: APIRoute = async ({ request, url }) => {
  const cookieHeader = request.headers.get('cookie');
  const token = getSessionFromCookie(cookieHeader);

  if (!isValidSession(token)) {
    return new Response(JSON.stringify({ error: 'No autorizado' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const sealId = url.searchParams.get('sealId');
  if (!sealId) {
    return new Response(JSON.stringify({ error: 'sealId es requerido' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const locations = await getLocationsBySealId(parseInt(sealId));
    return new Response(JSON.stringify({ locations }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error loading locations:', error);
    return new Response(
      JSON.stringify({
        error: 'Error al cargar las locaciones',
        details: error instanceof Error ? error.message : String(error)
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
};

// POST /api/admin/locations - Agregar nueva locación
export const POST: APIRoute = async ({ request }) => {
  const cookieHeader = request.headers.get('cookie');
  const token = getSessionFromCookie(cookieHeader);

  if (!isValidSession(token)) {
    return new Response(JSON.stringify({ error: 'No autorizado' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const body = await request.json();
    const { sealId, location } = body;

    if (!sealId || !location) {
      return new Response(
        JSON.stringify({ error: 'sealId y location son requeridos' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const newLocation = await addLocationToSeal(sealId, location.trim());

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Locación agregada exitosamente',
        location: newLocation
      }), {
        status: 201,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error adding location:', error);
    return new Response(
      JSON.stringify({
        error: 'Error al agregar la locación',
        details: error instanceof Error ? error.message : String(error)
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
};

// PUT /api/admin/locations - Actualizar locación existente
export const PUT: APIRoute = async ({ request }) => {
  const cookieHeader = request.headers.get('cookie');
  const token = getSessionFromCookie(cookieHeader);

  if (!isValidSession(token)) {
    return new Response(JSON.stringify({ error: 'No autorizado' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const body = await request.json();
    const { locationId, newLocation } = body;

    if (!locationId || !newLocation) {
      return new Response(
        JSON.stringify({ error: 'locationId y newLocation son requeridos' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const updated = await updateLocation(locationId, newLocation.trim());

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Locación actualizada exitosamente',
        location: updated
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error updating location:', error);
    return new Response(
      JSON.stringify({
        error: 'Error al actualizar la locación',
        details: error instanceof Error ? error.message : String(error)
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
};

// DELETE /api/admin/locations?locationId=123 - Eliminar locación
export const DELETE: APIRoute = async ({ request, url }) => {
  const cookieHeader = request.headers.get('cookie');
  const token = getSessionFromCookie(cookieHeader);

  if (!isValidSession(token)) {
    return new Response(JSON.stringify({ error: 'No autorizado' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const locationId = url.searchParams.get('locationId');
  if (!locationId) {
    return new Response(JSON.stringify({ error: 'locationId es requerido' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    await deleteLocation(parseInt(locationId));

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Locación eliminada exitosamente'
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error deleting location:', error);
    return new Response(
      JSON.stringify({
        error: 'Error al eliminar la locación',
        details: error instanceof Error ? error.message : String(error)
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
};
