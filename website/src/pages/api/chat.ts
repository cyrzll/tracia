import type { APIRoute } from 'astro';
import { db } from '../../lib/db';
import { MhsChat } from '../../lib/schema';
import { eq, asc } from 'drizzle-orm';
import { validateAdminSession, validateStudentSession } from '../../utils/auth';

// Helper to validate student session cookie or admin/lecturer session
async function validateSession(cookies: any, queryNim: string) {
  // Check student token
  const studentSession = await validateStudentSession(cookies);
  if (studentSession.isValid && studentSession.nim === queryNim) {
    return true;
  }
  // Check admin session
  const { isLoggedIn, adminInfo } = await validateAdminSession(cookies);
  if (isLoggedIn && adminInfo) {
    if (adminInfo.level === 'admin') return true;
    if (adminInfo.level.startsWith('lecturer-')) {
      const prodiPrefix = adminInfo.level.split('-')[1];
      if (queryNim.startsWith(prodiPrefix)) return true;
    }
  }
  return false;
}

// GET: Fetch all chat messages for a student
export const GET: APIRoute = async ({ cookies, url }) => {
  try {
    const nim = url.searchParams.get('nim');
    if (!nim) {
      return new Response(
        JSON.stringify({ success: false, error: 'NIM parameter is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Authenticate Access
    const isAuthorized = await validateSession(cookies, nim);
    if (!isAuthorized) {
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Fetch messages from DB sorted by creation time
    const chatHistory = await db
      .select({
        sender: MhsChat.sender,
        text: MhsChat.text,
        time: MhsChat.time
      })
      .from(MhsChat)
      .where(eq(MhsChat.nim, nim))
      .orderBy(asc(MhsChat.createdAt));

    return new Response(
      JSON.stringify({ success: true, messages: chatHistory }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error fetching chat history:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message || 'Server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

// POST: Save a chat message to the database
export const POST: APIRoute = async ({ cookies, request }) => {
  try {
    const body = await request.json();
    const { nim, sender, text, time } = body;

    if (!nim || !sender || !text || !time) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing required fields' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Authenticate Access
    const isAuthorized = await validateSession(cookies, nim);
    if (!isAuthorized) {
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Save message to database
    await db.insert(MhsChat).values({
      nim,
      sender,
      text,
      time
    });

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error saving chat message:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message || 'Server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
