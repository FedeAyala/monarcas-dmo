// Sistema de autenticación simple para admin
// Usa una contraseña definida en variable de entorno

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const SESSION_SECRET = process.env.SESSION_SECRET || 'dmo-seals-secret-key';

// Generar token de sesión simple
export function generateSessionToken(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2);
  return `${timestamp}-${random}`;
}

// Verificar contraseña de admin
export function verifyAdminPassword(password: string): boolean {
  if (!password) return false;
  // Normalize both sides: trim and remove surrounding quotes if present
  const normalize = (s: string | undefined) => {
    if (!s) return '';
    let t = s.trim();
    if ((t.startsWith('"') && t.endsWith('"')) || (t.startsWith("'") && t.endsWith("'"))) {
      t = t.substring(1, t.length - 1);
    }
    return t;
  };

  const provided = normalize(password);
  const expected = normalize(ADMIN_PASSWORD);

  return provided === expected;
}

// Crear cookie de sesión
export function createSessionCookie(token: string): string {
  const expires = new Date();
  expires.setDate(expires.getDate() + 7);
  return `admin_session=${token}; Path=/; HttpOnly; SameSite=Strict; Expires=${expires.toUTCString()}`;
}

// Eliminar cookie de sesión
export function deleteSessionCookie(): string {
  return 'admin_session=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0';
}

// Obtener token de cookie
export function getSessionFromCookie(cookieHeader: string | null): string | undefined {
  if (!cookieHeader) return undefined;
  
  const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split('=');
    acc[key] = value;
    return acc;
  }, {} as Record<string, string>);
  
  return cookies['admin_session'];
}

// Verificar si hay sesión válida (simplificado - solo verifica que existe el token)
export function isValidSession(token: string | undefined): boolean {
  return !!token && token.length > 10;
}
