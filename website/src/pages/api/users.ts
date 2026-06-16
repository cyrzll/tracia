import type { APIRoute } from 'astro';
import { db } from '../../lib/db';
import { User } from '../../lib/schema';
import { validateAdminSession } from '../../utils/auth';

export const GET: APIRoute = async ({ cookies }) => {
  try {
    // 1. Authenticate Request
    const { isLoggedIn, adminInfo } = await validateAdminSession(cookies);
    if (!isLoggedIn || !adminInfo || adminInfo.level !== 'admin') {
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 2. Fetch all users from local DB, excluding password
    const users = await db.select({
      username: User.username,
      name: User.name,
      email: User.email,
      level: User.level
    }).from(User);

    return new Response(
      JSON.stringify({ success: true, users }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error fetching users:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message || 'Server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
