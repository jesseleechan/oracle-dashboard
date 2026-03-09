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
    const { date, universalDay, transitAspect, tarotCards, scene, flowState, reflection } = await request.json();

    const newLog = await prisma.log.create({
      data: {
        date,
        universalDay,
        transitAspect,
        tarotCards,
        scene,
        flowState,
        reflection
      }
    });

    return NextResponse.json(newLog);
  } catch (error) {
    return NextResponse.json({ error: "Failed to save log" }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const { id, scene, sceneHistory, isRealized } = await request.json();

    if (!id) {
      return NextResponse.json({ error: "Missing log ID" }, { status: 400 });
    }

    const updatedLog = await prisma.log.update({
      where: { id },
      data: {
        ...(scene !== undefined && { scene }),
        ...(sceneHistory !== undefined && { sceneHistory }),
        ...(isRealized !== undefined && { isRealized })
      }
    });

    return NextResponse.json(updatedLog);
  } catch (error) {
    console.error("Failed to update log:", error);
    return NextResponse.json({ error: "Failed to update log" }, { status: 500 });
  }
}
