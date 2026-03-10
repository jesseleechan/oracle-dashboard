import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export async function POST(request) {
  try {
    const { personalYear, personalMonth, personalDay, yearName, planetaryHour, tarotCard, mode } = await request.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({
        insight: `Your ${personalYear} Personal Year whispers: assume the feeling of the wish fulfilled. It is already done.`
      });
    }

    const ai = new GoogleGenAI({ apiKey });

    let prompt;

    if (mode === 'affirmation') {
      prompt = `You are a Neville Goddard-aligned numerology oracle. The user is in:
- Personal Year ${personalYear} (${yearName})
- Personal Month ${personalMonth}
- Personal Day ${personalDay}
${planetaryHour ? `- Current Planetary Hour: ${planetaryHour}` : ''}
${tarotCard ? `- Today's Tarot: ${tarotCard}` : ''}

Create a powerful, personal daily affirmation (2-3 sentences max) synthesizing ALL the above numbers and context. 
Use Neville Goddard language: "I AM", "it is done", "I live from the end", "the feeling is the secret".
Make it feel deeply intimate and specific to these exact numbers. Do NOT explain numerology, just embody it.
Return ONLY the affirmation text, no quotes or formatting.`;
    } else {
      prompt = `You are a Neville Goddard-aligned numerology advisor. The user is in:
- Personal Year ${personalYear} (${yearName})
- Personal Month ${personalMonth}
- Personal Day ${personalDay}
${planetaryHour ? `- Current Planetary Hour: ${planetaryHour}` : ''}

Write exactly ONE sentence (max 25 words) of Neville Goddard guidance synthesizing the Personal Year energy with the current planetary hour.
Do NOT start with the number. Use language of surrender, naturalness, and "it is done".
Return ONLY the sentence, no quotes.`;
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite-preview",
      contents: prompt,
    });

    const text = response.text?.trim() || `Your ${personalYear} year hums with quiet power. Assume the state. It is already done.`;

    return NextResponse.json({ insight: text });
  } catch (e) {
    console.error("Numerology insight failed:", e);
    return NextResponse.json({ insight: "The numbers align. Your state is the only technique. Assume it now." });
  }
}
