// app/api/auth/logout/route.js

import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { serialize } from 'cookie';

const redis = require('@/lib/redis');

const COOKIE_NAME = process.env.COOKIE_NAME;
const JWT_SECRET = process.env.JWT_SECRET;

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

export async function POST(req) {

  const origin = req.headers.get('origin') || '*';

  const headers = {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true',
    'Content-Type': 'application/json',
  };

	const cookieStore = await cookies();
	const token = cookieStore.get(COOKIE_NAME)?.value;

	//console.log('[logout] token = ', token);

	if (!token) {
		return new NextResponse(JSON.stringify({ message: 'No token found' }), {
			status: 400,
			headers: headers,
		});
	}

	try {
		const decoded = jwt.verify(token, JWT_SECRET);
		//console.log('[logout] decoded = ', decoded);

		await redis.del(decoded.sessionId);

		// Invalida il cookie
		const cookie = serialize(COOKIE_NAME, '', {
			httpOnly: true,
			secure: true,
			sameSite: 'none',
			path: '/',
			maxAge: -1,
		});

		const response = new NextResponse(JSON.stringify({ message: 'Logged out' }), {
			status: 200,
			headers: {
				'Content-Type': 'application/json',
				'Set-Cookie': cookie,
			},
		});

		return response;

	} catch (err) {
		console.error('[logout] Error:', err);
		return new NextResponse(JSON.stringify({ message: err.message }), {
			status: 500,
			headers: {
				'Content-Type': 'application/json',
			},
		});
	}
}
