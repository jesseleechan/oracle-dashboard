import { NextResponse } from 'next/server';
import { USER_CONSTANTS } from '@/lib/config';
import { GoogleGenAI, Type } from '@google/genai';

export async function POST(request) {
  try {
    const { logs, journals, timeframe } = await request.json();
    
    if (!logs || !Array.isArray(logs) || logs.length === 0) {
      return NextResponse.json({ error: "Insufficient log data for Pattern Oracle" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "GEMINI_API_KEY not configured" }, { status: 500 });
    }

    const ai = new GoogleGenAI({ apiKey });

    // Format logs for context efficiency
    const contextualLogData = logs.map(l => 
      `[${l.date}] Flow: ${l.flowState || 'N/A'} | Transit: ${l.transitAspect || 'N/A'} | Anchor: ${l.tarotCards} | Assumption: ${l.assumptionText || 'N/A'} | Sephira: ${l.mappedSephira || 'N/A'} | Revised: ${l.isImpressed ? 'Yes' : 'No'} | Scene: ${l.scene}`
    ).join('\n');

    const contextualJournalData = journals && journals.length > 0 ? journals.map(j =>
      `[${j.date}] ${j.type.toUpperCase()}: ${j.content} | Analysis: ${j.geminiAnalysis?.substring(0, 100) || 'None'}`
    ).join('\n') : "No dream/synchronicity data recorded.";

    const prompt = `You are a holistic esoteric advisor for a creative entrepreneur named ${USER_CONSTANTS.name}. 
Profession: ${USER_CONSTANTS.profession}.

CORE PHILOSOPHY: YOU MUST STRICTLY APPLY NEVILLE GODDARD'S "LAW OF REVERSE EFFORT".
Analyze the provided log and dream journal data spanning the last ${timeframe || 30} days. Identify recurring atmospheric or psychological patterns.
Look closely for deep esoteric correlations: Do specific Tarot anchors or Astrological transits frequently precede "Pure Flow" days or successful revisions? Do specific Tree of Life mappings (Sephiroth) lead to higher states? What symbols keep showing up in dreams/signs?

Here is the log data:
${contextualLogData}

Here is the journal data (Dreams / Signs):
${contextualJournalData}

Extract 3 to 5 highly structured, profoundly deep macro-pattern insights. Weave in correlations like: 'Venus transits consistently preceded successful revisions', 'Netzach mappings led to the highest flow states', etc. Speak in poetic, Neville-aligned, non-hustle language. End with one gentle, commanding recommendation for the coming month (e.g. a SATS focus, revision theme, or Tree of Life path).

Return a strict JSON object with this exact structure:
- patterns: Array of objects, each containing:
    - title: (String, short punchy poetic title of the pattern)
    - detail: (String, 2-3 sentences digging into the root of the correlation, referencing specific cosmic transits, stars, or tarot where applicable)
    - guidance: (String, 1 concise sentence offering an actionable Neville Goddard assumption)
- synthesis: (String, A 1 paragraph concluding summary of their trajectory and the recommended focus for next month)`;

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            patterns: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  detail: { type: Type.STRING },
                  guidance: { type: Type.STRING }
                },
                required: ["title", "detail", "guidance"]
              }
            },
            synthesis: { type: Type.STRING }
          },
          required: ["patterns", "synthesis"]
        }
      }
    });

    const parsed = JSON.parse(response.text);
    return NextResponse.json(parsed);
    
  } catch (error) {
    console.error("Pattern Oracle generation failed:", error);
    if (error.status === 429 || error.message?.includes('429') || error.message?.includes('Quota')) {
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
    }
    return NextResponse.json({ error: "Failed to generate oracle patterns" }, { status: 500 });
  }
}
