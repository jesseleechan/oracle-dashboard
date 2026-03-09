import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const logs = await prisma.log.findMany({
      orderBy: { createdAt: 'desc' }
    });
    
    // Return standard JSON response enforcing attachment download mapping on client
    return new NextResponse(JSON.stringify(logs, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="mundane-state-backup-${new Date().toISOString().split('T')[0]}.json"`
      }
    });

  } catch (error) {
    console.error("Export Failed:", error);
    return NextResponse.json({ error: "Failed to export SQLite database." }, { status: 500 });
  }
}
