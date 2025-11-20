import type { APIRoute } from 'astro';
import { getSessionFromCookie, isValidSession } from '../../../lib/auth';

export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
  const cookieHeader = request.headers.get('cookie');
  const token = getSessionFromCookie(cookieHeader);
  const authenticated = isValidSession(token);

  return new Response(
    JSON.stringify({ authenticated }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
};
