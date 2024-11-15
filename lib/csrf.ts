import { nanoid } from 'nanoid';
import { NextApiRequest, NextApiResponse } from 'next';
import { serialize, parse } from 'cookie';

// Generar un token CSRF y establecerlo en una cookie
export function setCsrfCookie(res: NextApiResponse): string {
  const token: string = nanoid(); // Genera un token aleatorio
  const csrfCookie: string = serialize('csrfToken', token, {
    httpOnly: true, // Evitar acceso desde JavaScript
    secure: process.env.NODE_ENV === 'production', // Usar HTTPS en producción
    sameSite: 'strict', // Prevenir ataques CSRF
    path: '/', // Hacer que la cookie sea accesible en todo el sitio
  });
  res.setHeader('Set-Cookie', csrfCookie);
  return token;
}

// Validar el token CSRF
export function validateCsrfToken(req: NextApiRequest): boolean {
  const cookies: { [key: string]: string } = parse(req.headers.cookie || '');
  const csrfTokenFromCookie: string | undefined = cookies['csrfToken'];
  const csrfTokenFromHeader: string | undefined = req.headers['csrf-token'] as
    | string
    | undefined;

  if (!csrfTokenFromCookie || !csrfTokenFromHeader) {
    return false;
  }

  return csrfTokenFromCookie === csrfTokenFromHeader;
}
