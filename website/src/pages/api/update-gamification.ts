import type { APIRoute } from 'astro';
import { db } from '../../lib/db';
import { Mhs } from '../../lib/schema';
import { eq } from 'drizzle-orm';
import { validateStudentSession } from '../../utils/auth';

export const POST: APIRoute = async ({ cookies, request }) => {
  try {
    // Authenticate student session
    const studentSession = await validateStudentSession(cookies);
    if (!studentSession.isValid || !studentSession.nim) {
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const body = await request.json();
    const { nim, xp, streak, completedQuests } = body;

    // Security guard: Ensure NIM matches the authenticated session NIM
    if (studentSession.nim !== nim) {
      return new Response(
        JSON.stringify({ success: false, error: 'Forbidden: Cannot modify other student details' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (xp === undefined || streak === undefined || completedQuests === undefined) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing required fields' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Update in Database
    await db.update(Mhs).set({
      xp: Number(xp),
      streak: Number(streak),
      completedQuests: completedQuests,
      updatedAt: new Date()
    }).where(eq(Mhs.nim, nim));

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error updating student gamification:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message || 'Server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
