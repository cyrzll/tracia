import type { APIRoute } from 'astro';
import { db } from '../../lib/db';
import { User } from '../../lib/schema';
import { eq, and, ne } from 'drizzle-orm';
import { validateAdminSession } from '../../utils/auth';

export const POST: APIRoute = async ({ cookies, request }) => {
  try {
    // 1. Authenticate Request
    const { isLoggedIn, adminInfo } = await validateAdminSession(cookies);
    if (!isLoggedIn || !adminInfo || adminInfo.level !== 'admin') {
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 2. Parse request body
    const body = await request.json();
    const { username } = body;

    if (!username) {
      return new Response(
        JSON.stringify({ success: false, error: 'Username parameter is required.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 3. Prevent self-deletion of main admin account
    if (username === 'admin') {
      return new Response(
        JSON.stringify({ success: false, error: 'Restricted: The primary Super Admin account cannot be deleted.' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 4. Delete user from local DB
    await db.delete(User).where(eq(User.username, username));

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error deleting user:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message || 'Server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
