import { NextResponse } from 'next/server';
const redis = require('@/lib/redis');

export async function GET() {
  try {
    // Ping Redis server
    const ping = await redis.ping(); // should return 'PONG'

    if (ping !== 'PONG') {
      return new NextResponse(JSON.stringify({
        success: false,
        message: 'Redis is not responding correctly',
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Retrieve general Redis info
    const infoRaw = await redis.info();
    const info = parseRedisInfo(infoRaw);

    // Get number of keys in DB 0
    const totalKeys = await redis.dbsize();

    return new NextResponse(JSON.stringify({
      success: true,
      uptime: info.uptime_in_seconds + 's',
      redis_version: info.redis_version,
      connected_clients: info.connected_clients,
      used_memory_human: info.used_memory_human,
      total_keys: totalKeys,
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (err) {
    return new NextResponse(JSON.stringify({
      success: false,
      message: 'Unable to connect to Redis',
      details: err.message,
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// Helper function to parse raw Redis info
function parseRedisInfo(infoRaw) {
  const lines = infoRaw.split('\n');
  const data = {};

  lines.forEach(line => {
    if (line && line.includes(':')) {
      const [key, value] = line.split(':');
      data[key] = value.trim();
    }
  });

  return data;
}
