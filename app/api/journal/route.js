import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { GoogleGenAI } from '@google/genai';

// GET: Fetch journal entries
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const limit = parseInt(searchParams.get('limit') || '50');

    const where = {};
    if (type && type !== 'all') where.type = type;

    const entries = await prisma.journalEntry.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit
    });

    return NextResponse.json({ entries });
  } catch (e) {
    console.error("Journal fetch failed:", e);
    return NextResponse.json({ error: "Failed to fetch entries" }, { status: 500 });
  }
}

// POST: Create journal entry + optional Gemini analysis
export async function POST(request) {
  try {
    const { type, content, analyze, planetaryHour, hermeticPrinciple, personalYear, personalMonth, personalDay, tarotCards, assumptionText, asteroidInsight } = await request.json();

    if (!type || !content) {
      return NextResponse.json({ error: "Missing type or content" }, { status: 400 });
    }

    const today = new Date();
    const dateStr = today.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

    let geminiAnalysis = null;

    if (analyze) {
      const apiKey = process.env.GEMINI_API_KEY;
      if (apiKey) {
        try {
          const ai = new GoogleGenAI({ apiKey });
          const typeLabel = type === 'dream' ? 'dream' : 'synchronicity/sign';
          const prompt = `You are an archetypal dream analyst and Neville Goddard wisdom keeper.

The user recorded this ${typeLabel}:
"${content}"

Context:
${planetaryHour ? `- Current Planetary Hour: ${planetaryHour}` : ''}
${hermeticPrinciple ? `- Today's Hermetic Principle: ${hermeticPrinciple}` : ''}
${personalYear ? `- Personal Year: ${personalYear}, Month: ${personalMonth}, Day: ${personalDay}` : ''}
${tarotCards ? `- Today's tarot: ${tarotCards}` : ''}
${assumptionText ? `- Current Living in the End assumption: "${assumptionText}"` : ''}
${asteroidInsight ? `- Asteroid Whisper: ${asteroidInsight}` : ''}

Interpret this ${typeLabel} through Neville Goddard + esoteric wisdom. 
- Identify the key archetypal symbols and what they represent
- Connect them to the user's current manifestation work and cosmic context
- Give a short, poetic, actionable message about how this ${typeLabel} supports assuming the wish fulfilled
- If applicable, suggest how to use this in tonight's SATS or revision work
- Keep the tone mysterious, empowering, and deeply personal
- 3-5 sentences maximum
- Do NOT explain the technique, ONLY the interpretation`;

          const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
          });
          geminiAnalysis = response.text?.trim() || null;
        } catch (e) {
          console.error("Gemini analysis failed:", e);
          geminiAnalysis = "The subconscious speaks in symbols. This message is for you to decode through the feeling it evokes.";
        }
      }
    }

    const entry = await prisma.journalEntry.create({
      data: { type, content, date: dateStr, geminiAnalysis }
    });

    return NextResponse.json({ entry });
  } catch (e) {
    console.error("Journal save failed:", e);
    return NextResponse.json({ error: "Failed to save entry" }, { status: 500 });
  }
}
