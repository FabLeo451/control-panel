

import { NextResponse } from 'next/server';
import pool from '@/lib/db';

const JWT_SECRET = process.env.JWT_SECRET;
const COOKIE_NAME = process.env.COOKIE_NAME;
const SCHEMA = process.env.DB_SCHEMA;

// CORS preflight
export async function OPTIONS(request) {
    const origin = request.headers.get('origin') || 'http://localhost:3000';

    const response = new NextResponse(null, { status: 204 });
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    return response;
}

export async function GET(request) {

    const origin = request.headers.get('origin') || 'http://localhost:3000';

    const corsHeaders = {
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-user-agent',
        'Access-Control-Allow-Credentials': 'true',
    };

    var users = {};

    try {

        var query = `SELECT 
            u.id,
            u.user_name,
            u.name,
            u.email,
            u.status,
            STRING_AGG(DISTINCT ur.roles, ', ') AS roles,
            u.last_access,
            u.created
        FROM 
            ${SCHEMA}.users u
        JOIN 
            ${SCHEMA}.user_roles ur ON u.id = ur.user_id
        GROUP BY 
            u.id`;

        const result = await pool.query(query);

        users = result.rows;

    } catch (err) {
        console.log('[login]', err)
        var msg = 'Database error ' + err.code + ' ' + err.message;
        return new NextResponse(JSON.stringify({ message: 'Database error', error: err.message }), {
            status: 500,
            headers: corsHeaders,
        });
    }

    const response = NextResponse.json({users}, {
        status: 200,
        headers: corsHeaders,
    });

    return response;
}

