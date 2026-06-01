import { SignJWT, jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  import.meta.env.JWT_SECRET || 'super-secret-key-1234-change-me-in-production-tracia-ai'
);

export interface JWTPayload {
  uid: string;
  username: string;
  name: string;
  level: string;
}

/**
 * Generate Access Token (expires in 15 minutes)
 */
export async function generateAccessToken(payload: JWTPayload): Promise<string> {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('15m')
    .sign(JWT_SECRET);
}

/**
 * Generate Refresh Token (expires in 7 days)
 */
export async function generateRefreshToken(payload: JWTPayload): Promise<string> {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET);
}

/**
 * Verify JWT token and return payload if valid, otherwise return null
 */
export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return {
      uid: payload.uid as string,
      username: payload.username as string,
      name: payload.name as string,
      level: payload.level as string,
    };
  } catch (error) {
    return null;
  }
}
