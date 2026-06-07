import type { AstroCookies } from 'astro';
import { verifyToken, generateAccessToken } from './jwt';
import type { AuthResult, JWTPayload } from '@/types';

/**
 * Validates the admin session by verifying the JWT Access Token.
 * If the Access Token is missing or expired, it verifies the Refresh Token
 * and automatically issues a new Access Token if valid.
 */
export async function validateAdminSession(cookies: AstroCookies): Promise<AuthResult> {
  const accessTokenCookie = cookies.get('admin_access_token');
  const refreshTokenCookie = cookies.get('admin_refresh_token');

  // Case 1: Access Token exists and is valid
  if (accessTokenCookie) {
    const payload = await verifyToken(accessTokenCookie.value);
    if (payload && payload.level === 'admin') {
      return { isLoggedIn: true, adminInfo: payload };
    }
  }

  // Case 2: Access Token is missing or invalid, check Refresh Token
  if (refreshTokenCookie) {
    const payload = await verifyToken(refreshTokenCookie.value);
    if (payload && payload.level === 'admin') {
      // Generate a new Access Token
      const newAccessToken = await generateAccessToken({
        uid: payload.uid,
        username: payload.username,
        name: payload.name,
        level: payload.level
      });

      // Update the Access Token cookie
      cookies.set('admin_access_token', newAccessToken, {
        path: '/',
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        maxAge: 60 * 15 // 15 minutes
      });

      return { isLoggedIn: true, adminInfo: payload };
    }
  }

  // Case 3: Both tokens are invalid or missing
  return { isLoggedIn: false, adminInfo: null };
}

/**
 * Clears the admin session cookies
 */
export function clearAdminSession(cookies: AstroCookies) {
  cookies.delete('admin_access_token', { path: '/' });
  cookies.delete('admin_refresh_token', { path: '/' });
}
