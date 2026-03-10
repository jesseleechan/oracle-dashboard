import { NextResponse } from 'next/server';
import { USER_CONSTANTS } from '@/lib/config';
import { GoogleGenAI, Type } from '@google/genai';

export async function POST(request) {
  try {
    const { logs } = await request.json();
    
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
      `[${l.date}] Flow: ${l.flowState || 'N/A'} | Transit: ${l.transitAspect || 'N/A'} | Anchor: ${l.tarotCards} | Scene: ${l.scene}`
    ).join('\n');

    const prompt = `You are a holistic esoteric advisor for a creative entrepreneur named ${USER_CONSTANTS.name}. 
Profession: ${USER_CONSTANTS.profession}.

CORE PHILOSOPHY: YOU MUST STRICTLY APPLY NEVILLE GODDARD'S "LAW OF REVERSE EFFORT".
Analyze the provided log data spanning the last 60 days. Identify recurring atmospheric or psychological patterns.
Look closely for correlations: Do specific Tarot anchors or Astrological transits frequently precede "Pure Flow" days or "High Friction" states? Are their specific desires in the scenes that keep resurfacing?

Here is the log data:
${contextualLogData}

Extract 3 to 5 highly structured, actionable macro-pattern insights. Be poetic but ruthlessly analytical and practical over the data. Warn them if they are slipping into "forcing" rather than "allowing". 

Return a strict JSON object with this exact structure:
- patterns: Array of objects, each containing:
    - title: (String, short punchy title of the pattern)
    - detail: (String, 1-2 sentences digging into the root of the correlation)
    - advice: (String, 1 sentence mapped directly to dropping resistance)
- synthesis: (String, A 1 paragraph concluding summary of their trajectory)`;

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
                  advice: { type: Type.STRING }
                },
                required: ["title", "detail", "advice"]
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
