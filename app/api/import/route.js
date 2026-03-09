import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request) {
  try {
    const { logs } = await request.json();

    if (!logs || !Array.isArray(logs)) {
      return NextResponse.json({ error: "Invalid log payload format" }, { status: 400 });
    }

    // Wrap in a transaction to safely overwrite existing entries
    await prisma.$transaction(async (tx) => {
      for (const log of logs) {
        // Upsert by 'id' to prevent duplicating timelines if identical logs exist
        const isExisting = await tx.log.findUnique({
          where: { id: log.id }
        });

        if (isExisting) {
           await tx.log.update({
             where: { id: log.id },
             data: {
               scene: log.scene,
               flowState: log.flowState,
               isRealized: log.isRealized,
               reflection: log.reflection,
               sceneHistory: log.sceneHistory
             }
           });
        } else {
           await tx.log.create({
             data: {
               id: log.id, // Preserve native IDs ensuring relational integrity
               date: log.date,
               universalDay: log.universalDay,
               transitAspect: log.transitAspect,
               tarotCards: log.tarotCards,
               scene: log.scene,
               flowState: log.flowState,
               isRealized: log.isRealized,
               reflection: log.reflection,
               sceneHistory: log.sceneHistory,
               createdAt: log.createdAt
             }
           });
        }
      }
    });

    return NextResponse.json({ success: true, imported: logs.length });

  } catch (error) {
    console.error("Import Failed:", error);
    return NextResponse.json({ error: "Failed to restore SQLite logs." }, { status: 500 });
  }
}
