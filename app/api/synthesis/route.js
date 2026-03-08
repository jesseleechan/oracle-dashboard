import { NextResponse } from 'next/server';
import { USER_CONSTANTS } from '@/lib/config';
import { GoogleGenAI, Type } from '@google/genai';
import { Moon } from 'lunarphase-js';

export async function POST(request) {
  try {
    const { tarotCards, universalDay, transit } = await request.json();
    
    if (!tarotCards || !universalDay || !transit) {
      return NextResponse.json({ error: "Missing required cosmic data" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: "GEMINI_API_KEY not configured" }, { status: 500 });
    }

    const ai = new GoogleGenAI({ apiKey });
    const currentPhase = Moon.lunarPhase();

    const prompt = `You are a holistic esoteric advisor for a creative entrepreneur named ${USER_CONSTANTS.name}. 
Profession: ${USER_CONSTANTS.profession}.

CORE PHILOSOPHY: YOU MUST STRICTLY APPLY NEVILLE GODDARD'S "LAW OF REVERSE EFFORT".
You are absolutely forbidden from advising "hustling," "grinding," "pushing through," "trying harder," or "forcing" an outcome. 
Instead, you must advise on how to release resistance, assume the feeling of the wish fulfilled (the state of "naturalness"), and act from a place of relaxed certainty. Remind the user that success is already an established, mundane fact. The daily work (designing, living, creating) is simply the calm aftermath of that success.

Today's cosmic data:
- Moon Phase: ${currentPhase}
- Transit: ${transit.aspect}
- Universal Day Number: ${universalDay}
- Tarot cards drawn: ${tarotCards.join(", ")}

Generate generalized, holistic guidance that applies to ${USER_CONSTANTS.name}'s broader life, creativity, and daily rhythms. 
Use the moon phase (${currentPhase}) to determine the natural workflow rhythm (e.g., Waxing = initiating, Waning = refining/resting), but filter this entirely through the lens of effortless manifestation and allowing the 3D world to catch up to the 4D state.

Return a strict JSON object with this exact structure:
- tags: Array of 3 relevant string tags starting with a # (e.g., #Frictionless, #Naturalness, #Allowing)
- insight: A 2-3 sentence practical but holistic directive based on the transits and moon phase, strictly enforcing the Law of Reverse Effort.
- energyRatings: An array of exactly 8 objects, scoring the following categories strictly with the rating "Strong", "Active", or "Light":
  Categories: Career Ambition, Spiritual Attunement, Financial Resources, Mental Flow, Emotional State, Social Connection, Physical Vitality, Romantic Charge`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            tags: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Array of exactly 3 relevant tags starting with a #"
            },
            insight: {
              type: Type.STRING,
              description: "A 2-3 sentence practical holistic directive"
            },
            energyRatings: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  category: { type: Type.STRING },
                  rating: { type: Type.STRING }
                },
                required: ["category", "rating"]
              }
            }
          },
          required: ["tags", "insight", "energyRatings"]
        }
      }
    });

    const parsed = JSON.parse(response.text);
    return NextResponse.json(parsed);
  } catch (error) {
    console.error("Synthesis generation failed:", error);
    return NextResponse.json({ error: "Failed to generate synthesis" }, { status: 500 });
  }
}
