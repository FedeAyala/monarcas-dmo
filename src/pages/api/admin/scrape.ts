import type { APIRoute } from 'astro';
import { getSessionFromCookie, isValidSession } from '../../../lib/auth';
import { scrapeAndSave } from '../../../lib/scraper-neon';
import { 
  createScrapeLog, 
  updateScrapeLog, 
  getScrapeLogs,
  getSealsCount 
} from '../../../lib/neon';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    // Verificar que está autenticado
    const cookieHeader = request.headers.get('cookie');
    const token = getSessionFromCookie(cookieHeader);

    if (!isValidSession(token)) {
      return new Response(
        JSON.stringify({ error: 'No autorizado' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Crear log de scraping
    const logId = await createScrapeLog();

    try {
      // Ejecutar scraping
      await scrapeAndSave();
      
      // Obtener conteo de seals
      const sealsCount = await getSealsCount();
      
      // Actualizar log como exitoso
      await updateScrapeLog(logId, 'success', Number(sealsCount));

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Scraping completado exitosamente',
          sealsCount: Number(sealsCount)
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    } catch (scrapeError) {
      // Actualizar log como fallido
      const errorMessage = scrapeError instanceof Error ? scrapeError.message : 'Error desconocido';
      await updateScrapeLog(logId, 'failed', undefined, errorMessage);

      return new Response(
        JSON.stringify({ 
          error: 'Error durante el scraping', 
          details: errorMessage 
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error del servidor';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

// GET para obtener historial de scraping
export const GET: APIRoute = async ({ request }) => {
  try {
    // Verificar que está autenticado
    const cookieHeader = request.headers.get('cookie');
    const token = getSessionFromCookie(cookieHeader);

    if (!isValidSession(token)) {
      return new Response(
        JSON.stringify({ error: 'No autorizado' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const logs = await getScrapeLogs(20);

    return new Response(
      JSON.stringify({ logs }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Error al obtener logs' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
