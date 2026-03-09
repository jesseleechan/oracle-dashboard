import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET: Fetch friction/neutral scenes from last 30 days that are revision candidates
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter') || 'all'; // all, friction, neutral, impressed

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    let where = {
      createdAt: { gte: thirtyDaysAgo },
      scene: { not: '' }
    };

    if (filter === 'friction') where.flowState = 'Friction';
    else if (filter === 'neutral') where.flowState = 'Neutral';
    else if (filter === 'impressed') where.isImpressed = true;
    else if (filter === 'unrevised') {
      where.flowState = { in: ['Friction', 'Neutral'] };
      where.isImpressed = false;
    }

    const logs = await prisma.log.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        date: true,
        scene: true,
        flowState: true,
        revisedScene: true,
        revisedAt: true,
        isImpressed: true,
        transitAspect: true,
        tarotCards: true,
        createdAt: true
      }
    });

    return NextResponse.json({ logs });
  } catch (e) {
    console.error("Revisions fetch failed:", e);
    return NextResponse.json({ error: "Failed to fetch revisions" }, { status: 500 });
  }
}

// PATCH: Update a scene's revision
export async function PATCH(request) {
  try {
    const { id, revisedScene, isImpressed } = await request.json();

    if (!id) return NextResponse.json({ error: "Missing log id" }, { status: 400 });

    const updateData = {};
    if (revisedScene !== undefined) updateData.revisedScene = revisedScene;
    if (isImpressed !== undefined) {
      updateData.isImpressed = isImpressed;
      if (isImpressed) updateData.revisedAt = new Date();
    }

    const updated = await prisma.log.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json({ log: updated });
  } catch (e) {
    console.error("Revision update failed:", e);
    return NextResponse.json({ error: "Failed to update revision" }, { status: 500 });
  }
}
