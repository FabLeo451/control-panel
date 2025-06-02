import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import pool from '@/lib/db';

export async function POST(request) {

  const { searchParams } = new URL(request.url)
  const token = searchParams.get('token')

  console.log('[confirm] token =', token)

  try {

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const result = await pool.query(`select user_id from api.confirmations where request = 'sign-in' and token = $1`, [token]);

    if (result.rowCount > 0) {

      console.log('[confirm] result = ', result.rows[0]);

      let user_id = result.rows[0].user_id;

      await pool.query('BEGIN');
      await pool.query(`update api.users set status = 'enabled' where id = $1`, [user_id]);
      await pool.query(`delete from api.confirmations where token = $1`, [token]);
      await pool.query('COMMIT');

      return NextResponse.json({ message: 'Confirmed' }, { status: 200 });

    } else {
      return NextResponse.json({ message: 'Confirmation record not found' }, { status: 404 });
    }

  } catch (err) {
    await pool.query('ROLLBACK');

    let msg, status;

    msg = `Confirmation failed: ${err.code} ${err.message}`;
    status = 500;

    console.error('[signin] ', err);

    return NextResponse.json({ message: msg, err }, { status });
  }
}
