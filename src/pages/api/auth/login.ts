import type { APIRoute } from 'astro';
import { verifyAdminPassword, generateSessionToken, createSessionCookie } from '../../../lib/auth';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { password } = body;

    if (!password) {
      return new Response(
        JSON.stringify({ error: 'Contraseña requerida' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Debugging: log whether ADMIN_PASSWORD is configured (don't print it)
    try {
      const envSet = !!process.env.ADMIN_PASSWORD;
      const envLen = process.env.ADMIN_PASSWORD ? String(process.env.ADMIN_PASSWORD).length : 0;
      console.log(`[auth] ADMIN_PASSWORD set: ${envSet}, length: ${envLen}`);
    } catch (e) {
      console.log('[auth] Could not read ADMIN_PASSWORD from env');
    }

    if (!verifyAdminPassword(password)) {
      return new Response(
        JSON.stringify({ error: 'Contraseña incorrecta' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const token = generateSessionToken();

    return new Response(
      JSON.stringify({ success: true }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Set-Cookie': createSessionCookie(token)
        }
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Error de autenticación' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
