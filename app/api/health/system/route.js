import * as Utils from '@/lib/utils'
import { NextResponse } from 'next/server';

export async function GET() {
  /*
  const metrics = {
    platform: os.platform(),
    arch: os.arch(),
    uptime: `${Math.floor(os.uptime() / 60)} min`,
    loadavg: os.loadavg(), // useful on Linux/macOS
    totalMemoryMB: (os.totalmem() / 1024 / 1024).toFixed(2),
    freeMemoryMB: (os.freemem() / 1024 / 1024).toFixed(2),
    usedMemoryMB: ((os.totalmem() - os.freemem()) / 1024 / 1024).toFixed(2),
    cpuCount: os.cpus().length,
    cpuModel: os.cpus()[0]?.model || 'unknown',
  };
  */

  let metrics = Utils.getSystemMetrics();

  // Make it flat

  let result = { success: true };

  for (var k in metrics) {
    for (var m in metrics[k]) {
      result[k + '_' + m] = metrics[k][m]
    }
  }

  //return NextResponse.json({ result });

    return new NextResponse(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
}
