import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { serialize } from 'cookie';
const redis = require('@/lib/redis');

const JWT_SECRET = process.env.JWT_SECRET;
const COOKIE_NAME = process.env.COOKIE_NAME;

// Handle CORS preflight if needed
export async function OPTIONS(req) {
  const origin = req.headers.get('origin') || '*';

  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Credentials': 'true',
    },
  });
}

export async function GET(req) {
  const origin = req.headers.get('origin') || '*';

  const corsHeaders = {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true',
    'Content-Type': 'application/json',
  };

  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!token) {
    return new NextResponse(JSON.stringify({ message: 'User not authenticated' }), {
      status: 401,
      headers: corsHeaders,
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const sessionData = await redis.get(`${decoded.sessionId}`);

    if (!sessionData) {
      return new NextResponse(JSON.stringify({ message: 'Session not found' }), {
        status: 401,
        headers: corsHeaders,
      });
    }

    const data = JSON.parse(sessionData);

    return new NextResponse(JSON.stringify(data), {
      status: 200,
      headers: corsHeaders,
    });

  } catch (err) {
    return new NextResponse(JSON.stringify({ message: err.message }), {
      status: 401,
      headers: corsHeaders,
    });
  }
}
