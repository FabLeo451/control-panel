
// Returns a temporary token (used for websocket to retrieve session)

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;
const COOKIE_NAME = process.env.COOKIE_NAME;

export async function GET(req) {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!token) {
    return new NextResponse(JSON.stringify({ message: 'User not authenticated' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    const tempToken = jwt.sign(
      { sessionId: decoded.sessionId },
      JWT_SECRET,
      { expiresIn: '1m' } // 1 minute token
    );

    return new NextResponse(JSON.stringify({ token: tempToken }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (err) {
    return new NextResponse(JSON.stringify({ message: err.message }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
