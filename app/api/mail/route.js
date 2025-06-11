
import { NextResponse } from 'next/server';
import * as Mail from '@/lib/mail';

export async function POST() {

  var result = {};

  try {
    Mail.send('fabio_leone@yahoo.it', "Test", "Hello");
    console.log('[mail] Success');
  } catch (err) {
    console.log('[mail]', err);

    return new NextResponse(JSON.stringify(err), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new NextResponse(JSON.stringify(result), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
