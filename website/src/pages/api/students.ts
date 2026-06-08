import type { APIRoute } from 'astro';
import { db } from '../../lib/db';
import { Mhs } from '../../lib/schema';
import { validateAdminSession } from '../../utils/auth';

export const GET: APIRoute = async ({ cookies }) => {
  try {
    // 1. Authenticate Request
    const { isLoggedIn, adminInfo } = await validateAdminSession(cookies);
    if (!isLoggedIn || !adminInfo) {
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 2. Fetch All Students
    const students = await db.select().from(Mhs);

    return new Response(
      JSON.stringify({
        success: true,
        students
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error fetching students:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message || 'Server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
