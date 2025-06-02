import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    // Get PostgreSQL uptime
    const [{ uptime }] = await pool.query(
      `SELECT 
        CONCAT(
          EXTRACT(day FROM now() - pg_postmaster_start_time()), ' days ',
          EXTRACT(hour FROM now() - pg_postmaster_start_time()), ' hours ',
          EXTRACT(minute FROM now() - pg_postmaster_start_time()), ' minutes'
        ) AS uptime`
    ).then(res => res.rows);

    // Get total and active connections
    const [{ total_connections, active_connections }] = await pool.query(
      `SELECT
         count(*) AS total_connections,
         count(*) FILTER (WHERE state = 'active') AS active_connections
       FROM pg_stat_activity`
    ).then(res => res.rows);

    // Get database size
    const [{ db_size }] = await pool.query(
      `SELECT pg_size_pretty(pg_database_size(current_database())) AS db_size`
    ).then(res => res.rows);

    return new NextResponse(JSON.stringify({
      success: true,
      uptime,
      total_connections,
      active_connections,
      db_size
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err) {
    console.error('[PostgreSQL Health Error]', err);
    return new NextResponse(JSON.stringify({
      success: false,
      message: 'Database health check failed',
      details: err.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
