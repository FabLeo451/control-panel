import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import pool from '@/lib/db';
import * as Utils from '@/lib/utils';
import { serialize } from 'cookie';

import redis from '@/lib/redis';

const JWT_SECRET = process.env.JWT_SECRET;
const COOKIE_NAME = process.env.COOKIE_NAME;
const SCHEMA = process.env.DB_SCHEMA;

// curl -v -X POST -H "Origin: http://localhost:3000" -H "Content-Type: application/json" -d '{ "email":"q@w.e", "password": "fabio"}' http://192.168.1.126:3000/api/auth/login

// CORS preflight
export async function OPTIONS(request) {
    const origin = request.headers.get('origin') || 'http://localhost:3000';

    const response = new NextResponse(null, { status: 204 });
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-user-agent');
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    return response;
}

export async function POST(request) {

    const { searchParams } = new URL(request.url)
    const returnToken = searchParams.get('returnToken');

    const origin = request.headers.get('origin') || 'http://localhost:3000';

    const corsHeaders = {
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-user-agent',
        'Access-Control-Allow-Credentials': 'true',
    };

    let body;
    try {
        body = await request.json();
    } catch (err) {
        return new NextResponse(JSON.stringify({ message: 'Invalid JSON' }), {
            status: 400,
            headers: corsHeaders,
        });
    }

    //console.log('[login]', request.headers)

    const { email, password } = body;
    const userAgent = request.headers.get('user-agent') || '';
    const agent = request.headers.get('x-user-agent') || Utils.detectBrowser(userAgent);
    const platform = Utils.detectPlatform(userAgent);
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || '';

    var user = {};

    try {

        var query = `SELECT 
            u.id,
            u.name,
            (u.password = crypt($1, u.password)) AS password_match,
            STRING_AGG(DISTINCT ur.roles, ', ') AS roles,
            STRING_AGG(DISTINCT rp.id_privilege, ', ') AS privileges
        FROM 
            ${SCHEMA}.users u
        JOIN 
            ${SCHEMA}.user_roles ur ON u.id = ur.user_id
        LEFT JOIN 
            ${SCHEMA}.roles_privileges rp ON ur.roles = rp.id_role
        WHERE 
            LOWER(u.email) = LOWER($2)
            AND u.status = 'enabled'
        GROUP BY 
            u.id`;

        const result = await pool.query(query, [password, email]);

        if (result.rowCount === 0) {
            return new NextResponse(JSON.stringify({ message: 'User not found' }), {
                status: 401,
                headers: corsHeaders,
            });
        }

        if (!result.rows[0].password_match) {
            return new NextResponse(JSON.stringify({ message: 'Invalid password' }), {
                status: 401,
                headers: corsHeaders,
            });
        }

        user.id = result.rows[0].id;
        user.name = result.rows[0].name;
        user.email = email;
        user.roles = result.rows[0].roles.split(',');
        user.privileges = result.rows[0].privileges.split(',');

        // Save last logged time

        await pool.query(`update api.users set last_access = NOW() where id = $1`, [user.id]);

    } catch (err) {
        console.log('[login]', err)
        var msg = 'Database error ' + err.code + ' ' + err.message;
        //return res.status(500).json({ message: msg, err: err });
        return new NextResponse(JSON.stringify({ message: 'Database error', error: err.message }), {
            status: 500,
            headers: corsHeaders,
        });
    }

    const sessionId = uuidv4();
    const updated = new Date().toISOString();
    const status = 'idle';

    //console.log('Login sessionId = ' + sessionId);

    // Create a JWT token and set coocke

    const token = jwt.sign({ sessionId: sessionId, user: { name: user.name, roles: user.roles, privileges: user.privileges } }, JWT_SECRET, { expiresIn: '30m' });
    /*
        setCookie(res, COOKIE_NAME, token, {
            httpOnly: true,
            secure: true, // if HTTPS
            sameSite: 'none',
            path: '/'
        });
    */
    // ✅ Serializza il cookie
    const cookie = serialize(COOKIE_NAME, token, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        path: '/',
        //maxAge: 60 * 60 * 24 * 7 // 7 giorni
    });

    //console.log('[login] token = ', token);

    try {
        await redis.set(`${sessionId}`, JSON.stringify({ user, agent, platform, ip, token, updated, status }), 'EX', 3600);
    } catch (err) {
        return new NextResponse(JSON.stringify({ message: 'Redis unavailable', error: err.message }), {
            status: 500,
            headers: corsHeaders,
        });
    }

    const response = new NextResponse(JSON.stringify({ message: 'Successfully logged in', token: returnToken != null ? token : null }), {
        status: 200,
        headers: corsHeaders,
    });

    response.headers.set('Set-Cookie', cookie);
    return response;

}

