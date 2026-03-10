import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// POST: Save a generated pattern oracle
export async function POST(request) {
  try {
    const { timeframe, patterns } = await request.json();
    
    if (!timeframe || !patterns) {
      return NextResponse.json({ error: "Missing timeframe or patterns" }, { status: 400 });
    }

    const today = new Date();
    const dateStr = today.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

    const savedPattern = await prisma.savedPattern.create({
      data: {
        date: dateStr,
        timeframe,
        patterns // Expected to be stringified JSON
      }
    });

    return NextResponse.json({ savedPattern });
  } catch (error) {
    console.error("Failed to save pattern:", error);
    return NextResponse.json({ error: "Failed to pin pattern to the archive" }, { status: 500 });
  }
}

// GET: Fetch saved patterns
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');

    const patterns = await prisma.savedPattern.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit
    });
    
    return NextResponse.json({ patterns });
  } catch (error) {
    console.error("Failed to fetch saved patterns:", error);
    return NextResponse.json({ error: "Failed to fetch patterns" }, { status: 500 });
  }
}
