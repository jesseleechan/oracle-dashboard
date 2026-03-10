import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export async function POST(request) {
  try {
    const { planet, isDay } = await request.json();
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return NextResponse.json({ insight: `${planet} hour — settle into the feeling of the wish fulfilled.` });

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `You are a Neville Goddard-aligned esoteric advisor. The current planetary hour is ruled by ${planet} (${isDay ? 'daytime' : 'nighttime'} hour).

Write exactly ONE short sentence (max 20 words) of practical Neville Goddard manifestation guidance for this planetary hour. 
Use the planet's traditional esoteric quality (${planet === 'Venus' ? 'love, beauty, harmony' : planet === 'Jupiter' ? 'expansion, abundance, wisdom' : planet === 'Mars' ? 'courage, will, action' : planet === 'Sun' ? 'vitality, identity, success' : planet === 'Mercury' ? 'communication, clarity, trade' : planet === 'Moon' ? 'intuition, dreams, emotion' : 'discipline, structure, karma'}).
Do NOT start with the planet name. Use language of "assume the feeling", "it is done", "live from the end".
Return ONLY the sentence, no quotes or formatting.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite-preview",
      contents: prompt,
    });

    const text = response.text?.trim() || `${planet} hour — settle into the naturalness of your fulfilled desire.`;

    return NextResponse.json({ insight: text });
  } catch (e) {
    console.error("Planetary insight failed:", e);
    return NextResponse.json({ insight: "This hour is yours. Assume the state. It is already done." });
  }
}
