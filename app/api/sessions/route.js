import { NextResponse } from 'next/server'
import redis from '@/lib/redis';

export async function GET(request) {

    var result;

    try {

        const keys = await redis.keys('*'); // redis.keys() è bloccante e lento in produzione se hai tante chiavi! In quel caso, meglio usare SCAN
        const sessions = await redis.mget(...keys);

        const parsed = sessions.map((session, i) => ({
            key: keys[i],
            data: JSON.parse(session),
        }));

        result = parsed.sort(
            (a, b) => new Date(a.data.loginTime) - new Date(b.data.loginTime)
        );

    } catch (err) {

      console.error('Redis GET error:', err)
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })

    }


    //return res.status(200).json({ sessions: result });
    return NextResponse.json({ sessions: result }, { status: 200 })
}

export async function DELETE(request) {
  try {
    const body = await request.json();
    const { ids } = body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: 'Missing or invalid ids array in request body' },
        { status: 400 }
      );
    }

    const results = await redis.del(...ids);

    return NextResponse.json({
      message: `${results} key(s) deleted successfully`,
      deletedCount: results,
    }, { status: 200 });

  } catch (err) {
    console.error('Redis DELETE error:', err);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
