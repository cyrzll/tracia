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
    if (payload && (payload.level === 'admin' || payload.level.startsWith('lecturer'))) {
      return { isLoggedIn: true, adminInfo: payload };
    }
  }

  // Case 2: Access Token is missing or invalid, check Refresh Token
  if (refreshTokenCookie) {
    const payload = await verifyToken(refreshTokenCookie.value);
    if (payload && (payload.level === 'admin' || payload.level.startsWith('lecturer'))) {
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

/**
 * Validates the student session.
 * For dummy accounts, validates 'dummy-budi' locally.
 * For real accounts, queries Dian Nuswantoro University's SIADIN mini profile endpoint.
 */
export async function validateStudentSession(cookies: AstroCookies): Promise<{ isValid: boolean; nim: string | null }> {
  const mhsToken = cookies.get('mhs_access_token');
  if (!mhsToken) {
    return { isValid: false, nim: null };
  }

  if (mhsToken.value === 'dummy-budi') {
    return { isValid: true, nim: 'F11.2024.99999' };
  }

  try {
    const response = await fetch('https://api.dinus.ac.id/api/v1/siadin/get-mini-profile', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${mhsToken.value}`,
        'Accept': 'application/json'
      }
    });

    if (response.ok) {
      const result = await response.json();
      if (result && result.code === 200 && result.data && result.data.nim) {
        return { isValid: true, nim: result.data.nim };
      }
    }
  } catch (error) {
    console.error('Error validating student session with SIADIN:', error);
  }

  return { isValid: false, nim: null };
}
