import type { APIRoute } from 'astro';
import { db } from '../../lib/db';
import { User } from '../../lib/schema';
import { eq } from 'drizzle-orm';
import { validateAdminSession } from '../../utils/auth';

export const POST: APIRoute = async ({ cookies, request }) => {
  try {
    // 1. Authenticate Request - Only Super Admin can register users
    const { isLoggedIn, adminInfo } = await validateAdminSession(cookies);
    if (!isLoggedIn || !adminInfo || adminInfo.level !== 'admin') {
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized: Only Super Admin can register users.' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 2. Parse request body
    const body = await request.json();
    const { username, name, email, level, password } = body;

    if (!username || !name || !email || !level) {
      return new Response(
        JSON.stringify({ success: false, error: 'All fields (username, name, email, level) are required.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 3. Check if username or email already exists
    const existingUser = await db.select().from(User).where(eq(User.username, username)).limit(1);
    if (existingUser.length > 0) {
      return new Response(
        JSON.stringify({ success: false, error: 'Username already registered.' }),
        { status: 409, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 4. Register new user in Database
    const finalPassword = password || (username + '123');
    const newUid = crypto.randomUUID();

    await db.insert(User).values({
      uid: newUid,
      username,
      name,
      email,
      level,
      password: finalPassword
    });

    return new Response(
      JSON.stringify({ success: true, defaultPassword: finalPassword }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in user registration API:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message || 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
