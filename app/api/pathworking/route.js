import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export async function POST(request) {
  try {
    const { scene, sephira, pathNumber, planetaryHour, hermeticPrinciple, personalYear } = await request.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({
        pathworking: `Rest in ${sephira || 'this sphere'}. The wish is already fulfilled here. Feel its energy as your own.`
      });
    }

    const ai = new GoogleGenAI({ apiKey });
    const location = sephira ? `the Sephira of ${sephira}` : `Path ${pathNumber}`;

    const prompt = `You are a Qabalistic pathworking guide and Neville Goddard master.

Create a short Pathworking script for this scene on ${location} of the Tree of Life:

SCENE: "${scene}"

${planetaryHour ? `Current Planetary Hour: ${planetaryHour}` : ''}
${hermeticPrinciple ? `Today's Hermetic Principle: ${hermeticPrinciple}` : ''}
${personalYear ? `Personal Year: ${personalYear}` : ''}

Rules:
- Guide the imagination to assume the wish fulfilled using the specific energy of ${location}
- First person, present tense, deeply sensory
- Incorporate the Qabalistic symbolism of this sphere/path naturally
- Weave in today's cosmic influences
- Keep the tone hypnotic, reverent, and matter-of-fact (the wish IS done)
- 4-6 sentences maximum
- Do NOT explain Qabalah or the technique — ONLY the pathworking script`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const text = response.text?.trim() || `I stand in ${location}. The light of fulfillment surrounds me. It is done.`;
    return NextResponse.json({ pathworking: text });
  } catch (e) {
    console.error("Pathworking generation failed:", e);
    return NextResponse.json({
      pathworking: "The Tree holds your intention. Rest in the knowing. It is already placed upon the altar."
    });
  }
}
