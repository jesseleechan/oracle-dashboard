import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const logs = await prisma.log.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50
    });
    return NextResponse.json(logs);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch logs" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { date, universalDay, transitAspect, tarotCards, scene, flowState } = await request.json();

    const newLog = await prisma.log.create({
      data: {
        date,
        universalDay,
        transitAspect,
        tarotCards,
        scene,
        flowState
      }
    });

    return NextResponse.json(newLog);
  } catch (error) {
    return NextResponse.json({ error: "Failed to save log" }, { status: 500 });
  }
}
