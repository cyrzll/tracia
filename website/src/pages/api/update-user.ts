import type { APIRoute } from 'astro';
import { db } from '../../lib/db';
import { User } from '../../lib/schema';
import { eq, and, ne } from 'drizzle-orm';
import { validateAdminSession } from '../../utils/auth';

export const POST: APIRoute = async ({ cookies, request }) => {
  try {
    // 1. Authenticate Request - Only Super Admin can update users
    const { isLoggedIn, adminInfo } = await validateAdminSession(cookies);
    if (!isLoggedIn || !adminInfo || adminInfo.level !== 'admin') {
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized: Only Super Admin can edit users.' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 2. Parse request body
    const body = await request.json();
    const { originalUsername, username, name, email, level, password } = body;

    if (!originalUsername || !username || !name || !email || !level) {
      return new Response(
        JSON.stringify({ success: false, error: 'All fields are required.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 3. Prevent modification of main admin username to anything else
    if (originalUsername === 'admin' && username !== 'admin') {
      return new Response(
        JSON.stringify({ success: false, error: 'Restricted: The primary Super Admin username cannot be changed.' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 4. Check if the new username is already taken by another user
    if (username !== originalUsername) {
      const existingUser = await db.select().from(User).where(eq(User.username, username)).limit(1);
      if (existingUser.length > 0) {
        return new Response(
          JSON.stringify({ success: false, error: 'The new computed username is already registered.' }),
          { status: 409, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    // 5. Update user in Database
    const updateData: any = {
      username,
      name,
      email,
      level
    };
    if (password) {
      updateData.password = password;
    }

    await db.update(User)
      .set(updateData)
      .where(eq(User.username, originalUsername));

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error updating user:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message || 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
