import { NextResponse } from 'next/server';
import { GoogleGenAI, Type } from '@google/genai';

export async function POST(request) {
  try {
    const { birthYear, birthMonth, birthDay, transitAspect } = await request.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({
        whispers: [
          { name: "Chiron", transit: "Aspecting Natal Sun", insight: "The wounded healer brings attention to core identity. Healing happens through radical self-acceptance.", potentForSats: true }
        ]
      });
    }

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `You are a specialized esoteric astrologer focusing on Asteroids and Trans-Neptunians (Chiron, Black Moon Lilith, Juno, Vesta, Pallas, Ceres).

Dates provided:
- User Birth Date: ${birthYear ? `${birthYear}-` : ''}${birthMonth}-${birthDay}
- Current astrological context: ${transitAspect || 'General transit weather'}

Calculate/estimate the 1 to 2 most significant transiting asteroid aspects right now for this user's birth archetypes, and provide a Neville Goddard-aligned esoteric insight for each.

Return a strict JSON object with a single "whispers" array. Each object in the array must have:
- name: The asteroid name (e.g., "Chiron", "Lilith")
- transit: A short description of the transit (e.g., "Conjunct Natal Venus", "Transiting 8th House")
- insight: A single, potent sentence of esoteric or manifestation wisdom (e.g., "Assume the wound is already healed; feel the freedom of your true worth now.")
- potentForSats: A boolean (true/false) indicating if this particular transit is exceptionally powerful for intentional manifestation/SATS work tonight.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            whispers: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  transit: { type: Type.STRING },
                  insight: { type: Type.STRING },
                  potentForSats: { type: Type.BOOLEAN }
                },
                required: ["name", "transit", "insight", "potentForSats"]
              }
            }
          },
          required: ["whispers"]
        }
      }
    });

    const parsed = JSON.parse(response.text);
    return NextResponse.json(parsed);
  } catch (error) {
    console.error("Asteroid whisper generation failed:", error);
    return NextResponse.json({
      whispers: [
        { name: "Chiron", transit: "Healing Resonance", insight: "Where the void feels deepest, the imaginal act is most powerful.", potentForSats: true }
      ]
    });
  }
}
